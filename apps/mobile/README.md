# Mobile Secrets And Local Artifacts

This app no longer commits Firebase configs, keystores, Pods, or other machine-local native build outputs. Restore them locally or in CI before native builds, and keep the restored files untracked.

## Required restore contract

- `MOBILE_IOS_GOOGLE_SERVICE_INFO_PLIST_B64` -> `ios/GoogleService-Info.plist`
- `MOBILE_ANDROID_GOOGLE_SERVICES_JSON_B64` -> `android/app/google-services.json`
- `MOBILE_ANDROID_KEYSTORE_B64` -> `android/app/jirumalarmkey.jks`
- `MOBILE_ANDROID_KEYSTORE_PASSWORD` -> `android/keystore.properties` `storePassword`
- `MOBILE_ANDROID_KEY_ALIAS` -> `android/keystore.properties` `keyAlias`
- `MOBILE_ANDROID_KEY_PASSWORD` -> `android/keystore.properties` `keyPassword`

## Local or CI restore

Run from `apps/mobile`:

```bash
node -e "const fs=require('fs');fs.writeFileSync('ios/GoogleService-Info.plist',Buffer.from(process.env.MOBILE_IOS_GOOGLE_SERVICE_INFO_PLIST_B64,'base64'))"
node -e "const fs=require('fs');fs.writeFileSync('android/app/google-services.json',Buffer.from(process.env.MOBILE_ANDROID_GOOGLE_SERVICES_JSON_B64,'base64'))"
node -e "const fs=require('fs');fs.writeFileSync('android/app/jirumalarmkey.jks',Buffer.from(process.env.MOBILE_ANDROID_KEYSTORE_B64,'base64'))"
cat > android/keystore.properties <<EOF
storeFile=jirumalarmkey.jks
storePassword=${MOBILE_ANDROID_KEYSTORE_PASSWORD}
keyAlias=${MOBILE_ANDROID_KEY_ALIAS}
keyPassword=${MOBILE_ANDROID_KEY_PASSWORD}
EOF
```

`android/keystore.properties.example` shows the same file shape with explicit placeholders. `android/gradle.properties` now keeps sanitized placeholders only; `android/app/build.gradle` prefers `android/keystore.properties` when it exists.

If you need a local debug keystore, generate it in place and keep it ignored:

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore android/app/debug.keystore -alias androiddebugkey -storepass android -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Android Debug,O=Android,C=US"
```
