package com.solcode.jirmalam

import android.app.Application
import android.content.res.Configuration

import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative

import expo.modules.ApplicationLifecycleDispatcher
import expo.modules.ExpoReactHostFactory

// Expo SDK 57 템플릿(expo-template-bare-minimum@57)을 따른다 — RN 0.86 은 옛 ReactNativeHost 가 없어서
// ReactNativeHostWrapper 대신 ExpoReactHostFactory 가 ReactHost 를 만든다(expo-updates·dev-launcher 의
// host handler 는 이 팩토리가 붙인다). JS 진입점은 기본값 .expo/.virtual-metro-entry(iOS 와 같다).
class MainApplication : Application(), ReactApplication {

  override val reactHost: ReactHost by lazy {
    ExpoReactHostFactory.getDefaultReactHost(
      context = applicationContext,
      packageList =
        PackageList(this).packages.apply {
          // Packages that cannot be autolinked yet can be added manually here, for example:
          // add(MyReactNativePackage())
        }
    )
  }

  override fun onCreate() {
    super.onCreate()
    loadReactNative(this)
    ApplicationLifecycleDispatcher.onApplicationCreate(this)
  }

  override fun onConfigurationChanged(newConfig: Configuration) {
    super.onConfigurationChanged(newConfig)
    ApplicationLifecycleDispatcher.onConfigurationChanged(this, newConfig)
  }
}
