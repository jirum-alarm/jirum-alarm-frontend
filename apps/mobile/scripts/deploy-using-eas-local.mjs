#!/usr/bin/env node

import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {createInterface} from 'node:readline/promises';
import {stdin as input, stdout as output} from 'node:process';
import {dirname, extname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDir, '..');
const releaseNotePath = resolve(projectRoot, 'release-note.txt');
const iosProjectFile = resolve(projectRoot, 'ios/jirumAlarmMobile.xcodeproj/project.pbxproj');
const androidBuildGradle = resolve(projectRoot, 'android/app/build.gradle');

const semverRegExp = /^\d+\.\d+\.\d+$/u;

const rl = createInterface({input, output});

function ensureReleaseNote() {
  if (!existsSync(releaseNotePath)) {
    writeFileSync(releaseNotePath, 'Mobile local release\n\n- \n', 'utf8');
  }
}

function readIosBuildInfo() {
  const project = readFileSync(iosProjectFile, 'utf8');
  const buildNumbers = [...project.matchAll(/CURRENT_PROJECT_VERSION = ([0-9]+);/g)].map(match => Number(match[1]));
  const marketingVersions = [...project.matchAll(/MARKETING_VERSION = ([^;]+);/g)].map(match => match[1].trim());

  return {
    buildNumber: buildNumbers.length > 0 ? Math.max(...buildNumbers) : null,
    appVersion: marketingVersions[0] ?? null,
  };
}

function readAndroidBuildInfo() {
  const gradle = readFileSync(androidBuildGradle, 'utf8');
  const versionCodeMatch = gradle.match(/^\s*versionCode\s+([0-9]+)\s*$/m);
  const versionNameMatch = gradle.match(/^\s*versionName\s+"([^"]+)"\s*$/m);

  return {
    versionCode: versionCodeMatch ? Number(versionCodeMatch[1]) : null,
    appVersion: versionNameMatch?.[1] ?? null,
  };
}

function bumpSemver(version, bumpType) {
  if (!semverRegExp.test(version)) {
    throw new Error(`Cannot ${bumpType} bump non-semver app version: ${version}`);
  }

  const [major, minor, patch] = version.split('.').map(Number);

  if (bumpType === 'major') {
    return `${major + 1}.0.0`;
  }

  if (bumpType === 'minor') {
    return `${major}.${minor + 1}.0`;
  }

  if (bumpType === 'patch') {
    return `${major}.${minor}.${patch + 1}`;
  }

  return version;
}

function getCurrentAppVersions(platform) {
  const versions = [];

  if (platform === 'ios' || platform === 'all') {
    const ios = readIosBuildInfo();
    if (ios.appVersion) {
      versions.push(ios.appVersion);
    }
  }

  if (platform === 'android' || platform === 'all') {
    const android = readAndroidBuildInfo();
    if (android.appVersion) {
      versions.push(android.appVersion);
    }
  }

  return versions;
}

function buildVersionArgs(versionPlan) {
  const args = [];

  if (versionPlan?.buildNumberAction === 'keep') {
    args.push('--no-bump');
  }

  if (versionPlan?.appVersion) {
    args.push('--app-version', versionPlan.appVersion);
  }

  return args;
}

function run(command, args) {
  console.log(`\n$ ${[command, ...args].join(' ')}`);
  const result = spawnSync(command, args, {
    cwd: projectRoot,
    stdio: 'inherit',
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function runReleaseScript(scriptName, args) {
  run('node', [scriptName, ...args]);
}

async function ask(message, defaultValue = '') {
  const suffix = defaultValue ? ` (${defaultValue})` : '';
  const answer = await rl.question(`${message}${suffix}: `);
  return answer.trim() || defaultValue;
}

async function confirm(message, defaultValue = false) {
  const suffix = defaultValue ? 'Y/n' : 'y/N';
  const answer = (await rl.question(`${message} (${suffix}): `)).trim().toLowerCase();

  if (!answer) {
    return defaultValue;
  }

  return answer === 'y' || answer === 'yes';
}

async function select(message, choices) {
  console.log(`\n? ${message}`);
  choices.forEach((choice, index) => {
    const hint = choice.description ? ` - ${choice.description}` : '';
    console.log(`  ${index + 1}. ${choice.name}${hint}`);
  });

  while (true) {
    const answer = await ask('선택');
    const index = Number(answer) - 1;

    if (Number.isInteger(index) && choices[index]) {
      return choices[index].value;
    }

    console.log('목록에 있는 번호를 입력해 주세요.');
  }
}

async function editReleaseNoteWithEditor() {
  ensureReleaseNote();
  const editor = process.env.EDITOR || 'vi';
  run(editor, [releaseNotePath]);
}

async function writeReleaseNoteFromPrompt() {
  ensureReleaseNote();
  console.log('\n패치노트를 입력해 주세요. 빈 줄에서 Enter를 누르면 종료합니다.');
  const lines = [];

  while (true) {
    const line = await rl.question('> ');
    if (!line.trim()) {
      break;
    }
    lines.push(line);
  }

  writeFileSync(releaseNotePath, `${lines.join('\n')}\n`, 'utf8');
}

async function handleReleaseNote() {
  ensureReleaseNote();
  const currentNote = readFileSync(releaseNotePath, 'utf8').trim();

  console.log('\n현재 패치노트:');
  console.log(currentNote || '(비어 있음)');

  const action = await select('패치노트는 어떻게 할까요?', [
    {name: '현재 내용 사용', value: 'keep'},
    {name: '에디터로 수정', value: 'edit'},
    {name: '새로 작성', value: 'rewrite'},
  ]);

  if (action === 'edit') {
    await editReleaseNoteWithEditor();
  }

  if (action === 'rewrite') {
    await writeReleaseNoteFromPrompt();
  }

  const updatedNote = readFileSync(releaseNotePath, 'utf8').trim();
  if (!updatedNote) {
    const shouldContinue = await confirm('패치노트가 비어 있습니다. 계속할까요?', false);
    if (!shouldContinue) {
      process.exit(1);
    }
  }
}

function resolveEnvironment({purpose, selectedEnvironment}) {
  if (purpose === 'store-submit') {
    return 'production';
  }

  return selectedEnvironment;
}

function resolveProfile({purpose, environment}) {
  if (purpose === 'store-submit') {
    return 'production';
  }

  if (environment === 'development') {
    return 'test-dev';
  }

  return 'test-prod';
}

function getPlatformLabels(platform) {
  if (platform === 'all') {
    return ['iOS', 'Android'];
  }

  return [platform === 'ios' ? 'iOS' : 'Android'];
}

function buildPlannedVersionSummary(platform, versionPlan) {
  const lines = [];

  if (platform === 'ios' || platform === 'all') {
    const ios = readIosBuildInfo();
    const nextBuildNumber =
      versionPlan?.buildNumberAction === 'keep' || ios.buildNumber === null ? ios.buildNumber : ios.buildNumber + 1;
    lines.push(`iOS: ${versionPlan?.appVersion ?? ios.appVersion ?? 'unknown'} (${nextBuildNumber ?? 'unknown'})`);
  }

  if (platform === 'android' || platform === 'all') {
    const android = readAndroidBuildInfo();
    const nextVersionCode =
      versionPlan?.buildNumberAction === 'keep' || android.versionCode === null
        ? android.versionCode
        : android.versionCode + 1;
    lines.push(
      `Android: ${versionPlan?.appVersion ?? android.appVersion ?? 'unknown'} (${nextVersionCode ?? 'unknown'})`,
    );
  }

  return lines;
}

async function selectVersionPlan({purpose, platform}) {
  const choices = [
    {
      name: '앱 버전 유지, 빌드 번호만 증가',
      value: {appVersionAction: 'keep', buildNumberAction: 'bump', label: '앱 버전 유지, 빌드 번호만 증가'},
    },
    {name: 'patch 증가', value: {appVersionAction: 'patch', buildNumberAction: 'bump', label: 'patch 증가'}},
    {name: 'minor 증가', value: {appVersionAction: 'minor', buildNumberAction: 'bump', label: 'minor 증가'}},
    {name: 'major 증가', value: {appVersionAction: 'major', buildNumberAction: 'bump', label: 'major 증가'}},
    {name: '앱 버전 직접 입력', value: {appVersionAction: 'custom', buildNumberAction: 'bump', label: '직접 입력'}},
  ];

  if (purpose === 'build-only') {
    choices.push({
      name: '앱 버전과 빌드 번호 모두 유지',
      value: {appVersionAction: 'keep', buildNumberAction: 'keep', label: '앱 버전/빌드 번호 모두 유지'},
    });
  }

  const versionPlan = await select('버전 처리는 어떻게 할까요?', choices);

  if (versionPlan.appVersionAction === 'custom') {
    while (true) {
      const appVersion = await ask('앱 버전을 0.0.0 형식으로 입력해 주세요');
      if (semverRegExp.test(appVersion)) {
        return {...versionPlan, appVersion, label: `앱 버전 ${appVersion} 직접 입력`};
      }

      console.log('0.0.0 형식으로 입력해 주세요.');
    }
  }

  if (versionPlan.appVersionAction === 'keep') {
    return versionPlan;
  }

  const currentVersions = getCurrentAppVersions(platform);
  const baseVersion = currentVersions[0];
  if (!baseVersion) {
    throw new Error('현재 앱 버전을 읽을 수 없어 major/minor/patch 증가를 계산할 수 없습니다.');
  }

  const appVersion = bumpSemver(baseVersion, versionPlan.appVersionAction);
  return {...versionPlan, appVersion, label: `${versionPlan.label} -> ${appVersion}`};
}

async function selectExistingSubmitTarget() {
  return select('기존 빌드를 어디에 제출할까요?', [
    {name: '테스트 배포', value: 'test'},
    {name: '실제 스토어 제출', value: 'store'},
  ]);
}

async function selectExistingBuildPaths(platform) {
  const paths = {};

  if (platform === 'ios' || platform === 'all') {
    paths.ios = await ask('제출할 IPA 경로를 입력해 주세요', 'build/jirum-alarm-ios-1.3.5-10.ipa');
  }

  if (platform === 'android' || platform === 'all') {
    paths.android = await ask('제출할 Android 빌드 경로를 입력해 주세요', 'build/jirum-alarm-android-1.3.5-23.aab');
  }

  return paths;
}

function printSummary({purpose, platform, environment, profile, versionPlan, existingSubmitTarget, existingBuildPaths}) {
  console.log('\n실행 요약:');
  console.log(`- 목적: ${purposeLabels[purpose]}`);
  console.log(`- 플랫폼: ${getPlatformLabels(platform).join(' + ')}`);
  console.log(`- 환경: ${environment}${purpose === 'store-submit' ? ' 고정' : ''}`);
  console.log(`- EAS profile: ${profile}`);

  if (purpose === 'test-distribute') {
    if (platform === 'ios' || platform === 'all') {
      console.log('- iOS: EAS local build -> EAS Submit -> TestFlight');
    }
    if (platform === 'android' || platform === 'all') {
      console.log('- Android: EAS local build -> Play Store internal track 제출');
    }
  }

  if (purpose === 'store-submit') {
    if (platform === 'ios' || platform === 'all') {
      console.log('- iOS: EAS local build -> App Store Connect 업로드');
    }
    if (platform === 'android' || platform === 'all') {
      console.log('- Android: EAS local build -> Play Store production track 제출');
    }
  }

  if (purpose === 'build-only') {
    console.log('- 제출: 하지 않음');
  }

  if (purpose === 'submit-only') {
    console.log(`- 제출 대상: ${existingSubmitTarget === 'store' ? '실제 스토어 제출' : '테스트 배포'}`);
    if (existingBuildPaths?.ios) {
      console.log(`- IPA: ${existingBuildPaths.ios}`);
    }
    if (existingBuildPaths?.android) {
      console.log(`- Android 빌드: ${existingBuildPaths.android}`);
    }
  }

  if (versionPlan) {
    console.log(`- 버전 처리: ${versionPlan.label}`);
    for (const line of buildPlannedVersionSummary(platform, versionPlan)) {
      console.log(`  ${line}`);
    }
  }

  console.log(`- 패치노트: ${releaseNotePath}`);
}

function validateExistingAndroidPathForTarget(path, target) {
  const extension = extname(path).toLowerCase();

  if ((target === 'store' || target === 'test') && extension !== '.aab') {
    throw new Error('Android Play Store 제출은 .aab 파일만 허용합니다.');
  }
}

function runIos({purpose, profile, versionPlan, outputPath}) {
  const args = ['--profile', profile, ...buildVersionArgs(versionPlan)];

  if (purpose === 'build-only') {
    args.push('--no-submit');
  }

  if (purpose === 'submit-only') {
    args.push('--submit-only', '--output', outputPath);
  }

  runReleaseScript('scripts/ios-local-release.mjs', args);
}

function runAndroid({purpose, profile, versionPlan, outputPath, existingSubmitTarget}) {
  const args = ['--profile', profile, ...buildVersionArgs(versionPlan)];

  if (purpose === 'build-only') {
    args.push('--no-submit');
  }

  if (purpose === 'submit-only') {
    validateExistingAndroidPathForTarget(outputPath, existingSubmitTarget);
    args.push('--submit-only', '--output', outputPath);
  }

  runReleaseScript('scripts/android-local-release.mjs', args);
}

const purposeLabels = {
  'test-distribute': '테스트 배포',
  'store-submit': '실제 스토어 제출',
  'build-only': '빌드만 생성',
  'submit-only': '기존 빌드 제출',
  check: '사전 점검만 실행',
};

async function main() {
  const purpose = await select('무엇을 할까요?', [
    {name: '테스트 배포', value: 'test-distribute'},
    {name: '실제 스토어 제출', value: 'store-submit'},
    {name: '빌드만 생성', value: 'build-only'},
    {name: '기존 빌드 제출', value: 'submit-only'},
    {name: '사전 점검만 실행', value: 'check'},
  ]);

  const platform = await select('플랫폼은?', [
    {name: 'iOS', value: 'ios'},
    {name: 'Android', value: 'android'},
    {name: 'iOS + Android', value: 'all'},
  ]);

  if (purpose === 'check') {
    if (platform === 'ios' || platform === 'all') {
      runReleaseScript('scripts/ios-local-release.mjs', ['--profile', 'production', '--check']);
    }
    if (platform === 'android' || platform === 'all') {
      runReleaseScript('scripts/android-local-release.mjs', ['--profile', 'production', '--check']);
    }
    return;
  }

  let existingSubmitTarget = null;
  if (purpose === 'submit-only') {
    existingSubmitTarget = await selectExistingSubmitTarget();
  }

  const shouldAskEnvironment = purpose === 'test-distribute' || purpose === 'build-only' || existingSubmitTarget === 'test';
  const selectedEnvironment = shouldAskEnvironment
    ? await select('환경은?', [
        {name: 'development', value: 'development'},
        {name: 'production', value: 'production'},
      ])
    : 'production';

  const environment = resolveEnvironment({purpose, selectedEnvironment});
  const profile = resolveProfile({
    purpose: purpose === 'submit-only' && existingSubmitTarget === 'store' ? 'store-submit' : purpose,
    environment,
  });

  let versionPlan = null;
  if (purpose === 'test-distribute' || purpose === 'store-submit' || purpose === 'build-only') {
    versionPlan = await selectVersionPlan({purpose, platform});
  }

  let existingBuildPaths = null;
  if (purpose === 'submit-only') {
    existingBuildPaths = await selectExistingBuildPaths(platform);
  }

  await handleReleaseNote();

  printSummary({
    purpose,
    platform,
    environment,
    profile,
    versionPlan,
    existingSubmitTarget,
    existingBuildPaths,
  });

  const shouldRun = await confirm('진행할까요?', false);
  if (!shouldRun) {
    console.log('배포를 취소했습니다.');
    return;
  }

  mkdirSync(resolve(projectRoot, 'build'), {recursive: true});

  if (platform === 'ios' || platform === 'all') {
    runIos({
      purpose,
      profile,
      versionPlan,
      outputPath: existingBuildPaths?.ios,
    });
  }

  if (platform === 'android' || platform === 'all') {
    runAndroid({
      purpose,
      profile,
      versionPlan,
      outputPath: existingBuildPaths?.android,
      existingSubmitTarget,
    });
  }
}

main()
  .catch(error => {
    console.error('🚨', error.message);
    process.exit(1);
  })
  .finally(() => {
    rl.close();
  });
