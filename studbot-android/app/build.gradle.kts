plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
    id("com.google.devtools.ksp")
}

val adkVersion = "1.1.0"

android {
    namespace = "com.studex.studbot"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.studex.studbot"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "0.1.0"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro",
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_21
        targetCompatibility = JavaVersion.VERSION_21
    }

    buildFeatures {
        compose = true
    }

    packaging {
        resources {
            merges += "**/META-INF/INDEX.LIST"
            merges += "**/META-INF/DEPENDENCIES"
        }
    }
}

kotlin {
    jvmToolchain(21)
}

dependencies {
    implementation("com.google.adk:google-adk-kotlin-core:$adkVersion")
    implementation("com.google.adk:google-adk-kotlin-litertlm:$adkVersion")
    implementation("com.google.adk:google-adk-kotlin-mlkit-android:1.1.0-beta")
    ksp("com.google.adk:google-adk-kotlin-processor:$adkVersion")

    implementation("com.google.ai.edge.litertlm:litertlm-android:0.13.1")
    implementation("com.google.mlkit:genai-prompt:1.0.0-beta2")

    implementation(platform("androidx.compose:compose-bom:2024.10.01"))
    implementation("androidx.activity:activity-compose:1.9.3")
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.ui:ui-tooling-preview")
    debugImplementation("androidx.compose.ui:ui-tooling")

    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.7")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.8.7")
    implementation("androidx.navigation:navigation-compose:2.8.4")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.9.0")
}
