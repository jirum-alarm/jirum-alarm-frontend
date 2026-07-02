#!/usr/bin/env node

import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {createInterface} from 'node:readline/promises';
import {stdin as input, stdout as output} from 'node:process';
import {dirname, extname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  confirm as clackConfirm,
  isCancel,
  multiline as clackMultiline,
  multiselect,
  select as clackSelect,
  text as clackText,
} from '@clack/prompts';
import {assertProjectNode} from './project-runtime.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDir, '..');
const buildDir = resolve(projectRoot, 'build');
const releaseNotePath = resolve(projectRoot, 'release-note.txt');
const iosProjectFile = resolve(
  projectRoot,
  'ios/jirumAlarmMobile.xcodeproj/project.pbxproj',
);
const androidBuildGradle = resolve(projectRoot, 'android/app/build.gradle');

const semverRegExp = /^\d+\.\d+\.\d+$/u;

let fallbackReadline = null;

function getFallbackReadline() {
  fallbackReadline ??= createInterface({input, output});
  return fallbackReadline;
}

async function questionWithReadline(message) {
  return getFallbackReadline().question(message);
}

function ensureReleaseNote() {
  if (!existsSync(releaseNotePath)) {
    writeFileSync(releaseNotePath, 'Mobile local release\n\n- \n', 'utf8');
  }
}

function readIosBuildInfo() {
  const project = readFileSync(iosProjectFile, 'utf8');
  const buildNumbers = [
    ...project.matchAll(/CURRENT_PROJECT_VERSION = ([0-9]+);/g),
  ].map(match => Number(match[1]));
  const marketingVersions = [
    ...project.matchAll(/MARKETING_VERSION = ([^;]+);/g),
  ].map(match => match[1].trim());

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
    throw new Error(
      `Cannot ${bumpType} bump non-semver app version: ${version}`,
    );
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

function findLatestBuildArtifact({prefix, extension}) {
  if (!existsSync(buildDir)) {
    return '';
  }

  const latestArtifact = readdirSync(buildDir, {withFileTypes: true})
    .filter(
      entry =>
        entry.isFile() &&
        entry.name.startsWith(prefix) &&
        extname(entry.name).toLowerCase() === extension,
    )
    .map(entry => {
      const path = resolve(buildDir, entry.name);
      return {
        name: entry.name,
        mtimeMs: statSync(path).mtimeMs,
      };
    })
    .sort((left, right) => right.mtimeMs - left.mtimeMs)[0];

  return latestArtifact ? `build/${latestArtifact.name}` : '';
}

function normalizeExistingBuildPath(path) {
  if (!path || path.includes('/') || path.startsWith('~')) {
    return path;
  }

  const buildPath = `build/${path}`;
  return existsSync(resolve(projectRoot, buildPath)) ? buildPath : path;
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
  if (canUseInteractiveSelect()) {
    const answer = await clackText({
      message,
      placeholder: defaultValue || undefined,
      defaultValue,
    });

    if (isCancel(answer)) {
      throw new Error('사용자가 선택을 취소했습니다.');
    }

    return answer.trim() || defaultValue;
  }

  const suffix = defaultValue ? ` (${defaultValue})` : '';
  const answer = await questionWithReadline(`${message}${suffix}: `);
  return answer.trim() || defaultValue;
}

async function confirm(message, defaultValue = false) {
  if (canUseInteractiveSelect()) {
    const answer = await clackConfirm({
      message,
      active: '예',
      inactive: '아니오',
      initialValue: defaultValue,
    });

    if (isCancel(answer)) {
      throw new Error('사용자가 선택을 취소했습니다.');
    }

    return answer;
  }

  const suffix = defaultValue ? 'Y/n' : 'y/N';
  const answer = (await questionWithReadline(`${message} (${suffix}): `))
    .trim()
    .toLowerCase();

  if (!answer) {
    return defaultValue;
  }

  return answer === 'y' || answer === 'yes';
}

function canUseInteractiveSelect() {
  return Boolean(input.isTTY && output.isTTY);
}

async function selectManyWithNumber(
  message,
  choices,
  {min = 1, max = choices.length} = {},
) {
  console.log(`\n? ${message}`);
  choices.forEach((choice, index) => {
    const hint = choice.description ? ` - ${choice.description}` : '';
    console.log(`  ${index + 1}. ${choice.name}${hint}`);
  });

  while (true) {
    const answer = await ask(max === 1 ? '선택' : '선택(쉼표로 구분)');
    const indexes = [
      ...new Set(
        answer
          .split(',')
          .map(value => Number(value.trim()) - 1)
          .filter(index => Number.isInteger(index)),
      ),
    ];

    if (
      indexes.length >= min &&
      indexes.length <= max &&
      indexes.every(index => choices[index])
    ) {
      return indexes.map(index => choices[index].value);
    }

    if (max === 1) {
      console.log('목록에 있는 번호를 입력해 주세요.');
    } else {
      console.log(
        `${min}개 이상 ${max}개 이하로 목록에 있는 번호를 입력해 주세요.`,
      );
    }
  }
}

async function selectMany(
  message,
  choices,
  {min = 1, max = choices.length} = {},
) {
  if (choices.length === 0) {
    throw new Error(`${message} 선택지가 없습니다.`);
  }

  if (!canUseInteractiveSelect()) {
    return selectManyWithNumber(message, choices, {min, max});
  }

  while (true) {
    const response = await multiselect({
      message,
      options: choices.map(choice => ({
        label: choice.name,
        hint: choice.description,
        value: choice.value,
      })),
      required: min > 0,
    });

    if (isCancel(response)) {
      throw new Error('사용자가 선택을 취소했습니다.');
    }

    if (response.length >= min && response.length <= max) {
      return response;
    }

    if (max === 1) {
      console.log('하나만 선택해 주세요.');
    } else {
      console.log(`${min}개 이상 ${max}개 이하로 선택해 주세요.`);
    }
  }
}

async function select(message, choices) {
  if (choices.length === 0) {
    throw new Error(`${message} 선택지가 없습니다.`);
  }

  if (!canUseInteractiveSelect()) {
    const selectedValues = await selectManyWithNumber(message, choices, {
      min: 1,
      max: 1,
    });
    return selectedValues[0];
  }

  const response = await clackSelect({
    message,
    options: choices.map(choice => ({
      label: choice.name,
      hint: choice.description,
      value: choice.value,
    })),
  });

  if (isCancel(response)) {
    throw new Error('사용자가 선택을 취소했습니다.');
  }

  return response;
}

async function selectPlatform() {
  const platforms = await selectMany('플랫폼은?', [
    {name: 'iOS', value: 'ios'},
    {name: 'Android', value: 'android'},
  ]);

  return platforms.length === 2 ? 'all' : platforms[0];
}

async function editReleaseNoteWithEditor() {
  ensureReleaseNote();
  const editor = process.env.EDITOR || 'vi';
  run(editor, [releaseNotePath]);
}

async function writeReleaseNoteFromPrompt() {
  ensureReleaseNote();

  if (canUseInteractiveSelect()) {
    const note = await clackMultiline({
      message: 'TestFlight 테스트 내용을 입력해 주세요.',
      placeholder: '빈 값으로 제출하면 비어 있는 테스트 내용으로 처리됩니다.',
      showSubmit: true,
    });

    if (isCancel(note)) {
      throw new Error('사용자가 선택을 취소했습니다.');
    }

    writeFileSync(releaseNotePath, `${note.trim()}\n`, 'utf8');
    return;
  }

  console.log(
    '\nTestFlight 테스트 내용을 입력해 주세요. 빈 줄에서 Enter를 누르면 종료합니다.',
  );
  const lines = [];

  while (true) {
    const line = await questionWithReadline('> ');
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

  console.log('\n현재 TestFlight 테스트 내용:');
  console.log(currentNote || '(비어 있음)');

  const action = await select('TestFlight 테스트 내용은 어떻게 할까요?', [
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
    const shouldContinue = await confirm(
      'TestFlight 테스트 내용이 비어 있습니다. 계속할까요?',
      false,
    );
    if (!shouldContinue) {
      process.exit(1);
    }
  }

  return updatedNote;
}

function resolveEnvironment({purpose, selectedEnvironment}) {
  if (purpose === 'store-submit') {
    return 'production';
  }

  return selectedEnvironment;
}

function resolveProfile({purpose, environment, existingSubmitTarget}) {
  if (purpose === 'store-submit') {
    return 'production';
  }

  if (purpose === 'submit-only') {
    return existingSubmitTarget === 'store' ? 'production' : 'test-dev';
  }

  if (environment === 'development') {
    return 'test-dev';
  }

  return 'test-prod';
}

function shouldUseTestFlightNote({purpose, platform, existingSubmitTarget}) {
  const includesIos = platform === 'ios' || platform === 'all';

  if (!includesIos) {
    return false;
  }

  return (
    purpose === 'test-distribute' ||
    (purpose === 'submit-only' && existingSubmitTarget === 'test')
  );
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
      versionPlan?.buildNumberAction === 'keep' || ios.buildNumber === null
        ? ios.buildNumber
        : ios.buildNumber + 1;
    lines.push(
      `iOS: ${versionPlan?.appVersion ?? ios.appVersion ?? 'unknown'} (${
        nextBuildNumber ?? 'unknown'
      })`,
    );
  }

  if (platform === 'android' || platform === 'all') {
    const android = readAndroidBuildInfo();
    const nextVersionCode =
      versionPlan?.buildNumberAction === 'keep' || android.versionCode === null
        ? android.versionCode
        : android.versionCode + 1;
    lines.push(
      `Android: ${
        versionPlan?.appVersion ?? android.appVersion ?? 'unknown'
      } (${nextVersionCode ?? 'unknown'})`,
    );
  }

  return lines;
}

async function selectVersionPlan({platform}) {
  const choices = [
    {
      name: '앱 버전 유지, 빌드 번호만 증가',
      value: {
        appVersionAction: 'keep',
        buildNumberAction: 'bump',
        label: '앱 버전 유지, 빌드 번호만 증가',
      },
    },
    {
      name: 'patch 증가',
      value: {
        appVersionAction: 'patch',
        buildNumberAction: 'bump',
        label: 'patch 증가',
      },
    },
    {
      name: 'minor 증가',
      value: {
        appVersionAction: 'minor',
        buildNumberAction: 'bump',
        label: 'minor 증가',
      },
    },
    {
      name: 'major 증가',
      value: {
        appVersionAction: 'major',
        buildNumberAction: 'bump',
        label: 'major 증가',
      },
    },
    {
      name: '앱 버전 직접 입력',
      value: {
        appVersionAction: 'custom',
        buildNumberAction: 'bump',
        label: '직접 입력',
      },
    },
  ];

  const versionPlan = await select('버전 처리는 어떻게 할까요?', choices);

  if (versionPlan.appVersionAction === 'custom') {
    while (true) {
      const appVersion = await ask('앱 버전을 0.0.0 형식으로 입력해 주세요');
      if (semverRegExp.test(appVersion)) {
        return {
          ...versionPlan,
          appVersion,
          label: `앱 버전 ${appVersion} 직접 입력`,
        };
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
    throw new Error(
      '현재 앱 버전을 읽을 수 없어 major/minor/patch 증가를 계산할 수 없습니다.',
    );
  }

  const appVersion = bumpSemver(baseVersion, versionPlan.appVersionAction);
  return {
    ...versionPlan,
    appVersion,
    label: `${versionPlan.label} -> ${appVersion}`,
  };
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
    paths.ios = normalizeExistingBuildPath(await ask(
      '제출할 IPA 경로를 입력해 주세요',
      findLatestBuildArtifact({
        prefix: 'jirum-alarm-ios-',
        extension: '.ipa',
      }),
    ));
  }

  if (platform === 'android' || platform === 'all') {
    paths.android = normalizeExistingBuildPath(await ask(
      '제출할 Android 빌드 경로를 입력해 주세요',
      findLatestBuildArtifact({
        prefix: 'jirum-alarm-android-',
        extension: '.aab',
      }),
    ));
  }

  return paths;
}

function printSummary({
  purpose,
  platform,
  environment,
  profile,
  versionPlan,
  existingSubmitTarget,
  existingBuildPaths,
  testFlightNote,
}) {
  console.log('\n실행 요약:');
  console.log(`- 목적: ${purposeLabels[purpose]}`);
  console.log(`- 플랫폼: ${getPlatformLabels(platform).join(' + ')}`);
  if (purpose === 'submit-only') {
    console.log('- 환경: 기존 빌드에 포함된 값 사용');
  } else {
    console.log(
      `- 환경: ${environment}${purpose === 'store-submit' ? ' 고정' : ''}`,
    );
  }
  console.log(`- EAS profile: ${profile}`);

  if (purpose === 'test-distribute') {
    if (platform === 'ios' || platform === 'all') {
      console.log('- iOS: EAS local build -> EAS Submit -> TestFlight');
    }
    if (platform === 'android' || platform === 'all') {
      console.log(
        '- Android: EAS local build -> Play Store internal track 제출',
      );
    }
  }

  if (purpose === 'store-submit') {
    if (platform === 'ios' || platform === 'all') {
      console.log('- iOS: EAS local build -> App Store Connect 업로드');
    }
    if (platform === 'android' || platform === 'all') {
      console.log(
        '- Android: EAS local build -> Play Store production track 제출',
      );
    }
  }

  if (purpose === 'submit-only') {
    console.log(
      `- 제출 대상: ${
        existingSubmitTarget === 'store' ? '실제 스토어 제출' : '테스트 배포'
      }`,
    );
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

  if (testFlightNote !== null) {
    console.log(`- TestFlight 테스트 내용: ${releaseNotePath}`);
  }
}

function validateExistingAndroidPathForTarget(path, target) {
  const extension = extname(path).toLowerCase();

  if ((target === 'store' || target === 'test') && extension !== '.aab') {
    throw new Error('Android Play Store 제출은 .aab 파일만 허용합니다.');
  }
}

function runIos({purpose, profile, versionPlan, outputPath, testFlightNote}) {
  const args = ['--profile', profile, ...buildVersionArgs(versionPlan)];

  if (purpose === 'submit-only') {
    args.push('--submit-only', '--output', outputPath);
  }

  if (testFlightNote) {
    args.push('--what-to-test', testFlightNote);
  }

  runReleaseScript('scripts/ios-local-release.mjs', args);
}

function runAndroid({
  purpose,
  profile,
  versionPlan,
  outputPath,
  existingSubmitTarget,
}) {
  const args = ['--profile', profile, ...buildVersionArgs(versionPlan)];

  if (purpose === 'submit-only') {
    validateExistingAndroidPathForTarget(outputPath, existingSubmitTarget);
    args.push('--submit-only', '--output', outputPath);
  }

  runReleaseScript('scripts/android-local-release.mjs', args);
}

const purposeLabels = {
  'test-distribute': '테스트 배포',
  'store-submit': '실제 스토어 제출',
  'submit-only': '기존 빌드 제출',
};

async function main() {
  assertProjectNode(projectRoot);

  const purpose = await select('무엇을 할까요?', [
    {name: '테스트 배포', value: 'test-distribute'},
    {name: '실제 스토어 제출', value: 'store-submit'},
    {name: '기존 빌드 제출', value: 'submit-only'},
  ]);

  const platform = await selectPlatform();

  let existingSubmitTarget = null;
  if (purpose === 'submit-only') {
    existingSubmitTarget = await selectExistingSubmitTarget();
  }

  const shouldAskEnvironment = purpose === 'test-distribute';
  const selectedEnvironment = shouldAskEnvironment
    ? await select('환경은?', [
        {name: 'development', value: 'development'},
        {name: 'production', value: 'production'},
      ])
    : 'production';

  const environment =
    purpose === 'submit-only'
      ? null
      : resolveEnvironment({purpose, selectedEnvironment});
  const profile = resolveProfile({
    purpose,
    environment,
    existingSubmitTarget,
  });

  let versionPlan = null;
  if (
    purpose === 'test-distribute' ||
    purpose === 'store-submit'
  ) {
    versionPlan = await selectVersionPlan({platform});
  }

  let existingBuildPaths = null;
  if (purpose === 'submit-only') {
    existingBuildPaths = await selectExistingBuildPaths(platform);
  }

  const needsTestFlightNote = shouldUseTestFlightNote({
    purpose,
    platform,
    existingSubmitTarget,
  });
  const testFlightNote = needsTestFlightNote ? await handleReleaseNote() : null;

  printSummary({
    purpose,
    platform,
    environment,
    profile,
    versionPlan,
    existingSubmitTarget,
    existingBuildPaths,
    testFlightNote,
  });

  const shouldRun = await confirm('진행할까요?', true);
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
      testFlightNote,
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
    fallbackReadline?.close();
  });
