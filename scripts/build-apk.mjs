/**
 * 构建 Android APK：默认 debug，加 --release 出正式签名包。
 *
 * Capacitor 6 / AGP 8.x 需要 JDK 17；本机默认 java 可能是旧版本，
 * 因此此处按优先级选择 JAVA_HOME：环境变量 > 常见安装路径。
 * Android SDK 同理：ANDROID_HOME > ANDROID_SDK_ROOT > 常见路径。
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../android", import.meta.url));
const RELEASE = process.argv.includes("--release");

const pick = (envValue, candidates) => {
  if (envValue && existsSync(envValue)) return envValue;
  for (const c of candidates) if (existsSync(c)) return c;
  return null;
};

/** 读取 major 版本；无法解析时按 0 处理。 */
function javaMajor(home) {
  if (!home) return 0;
  const exe = join(home, "bin", process.platform === "win32" ? "java.exe" : "java");
  if (!existsSync(exe)) return 0;
  const out = spawnSync(exe, ["-version"], { encoding: "utf8" });
  const text = `${out.stdout ?? ""}${out.stderr ?? ""}`;
  const match = /version\s+"(?:1\.)?(\d+)/.exec(text);
  return match ? Number(match[1]) : 0;
}

const JAVA_CANDIDATES = [
  "D:/Develop/jdk/jdk17",
  "C:/Program Files/Eclipse Adoptium/jdk-17",
  "C:/Program Files/Java/jdk-17",
  "D:/Develop/jdk/jdk21",
];
// 环境变量里的 JAVA_HOME 常指向 jdk8（系统默认），必须校验版本后再采用。
let javaHome = pick(process.env.JAVA_HOME, JAVA_CANDIDATES);
if (javaMajor(javaHome) < 17) {
  javaHome = JAVA_CANDIDATES.find((c) => existsSync(c) && javaMajor(c) >= 17) ?? null;
}
if (!javaHome) throw new Error("未找到 JDK 17+。请设置 JAVA_HOME 指向 JDK 17 或更高版本。");

const androidHome = pick(process.env.ANDROID_HOME ?? process.env.ANDROID_SDK_ROOT, [
  "E:/Android/Sdk",
  join(process.env.LOCALAPPDATA ?? "", "Android/Sdk"),
], "Android SDK");

const env = {
  ...process.env,
  JAVA_HOME: javaHome,
  ANDROID_HOME: androidHome,
  ANDROID_SDK_ROOT: androidHome,
  PATH: `${join(javaHome, "bin")}${process.platform === "win32" ? ";" : ":"}${process.env.PATH ?? ""}`,
};

// 不用 gradlew.bat：Git Bash 下 PATH 分隔符混用会让批处理找到系统旧版 java。
// 直接用绝对 JDK 路径启动 GradleWrapperMain，确保 JVM 版本可控。
const javaExe = join(javaHome, "bin", process.platform === "win32" ? "java.exe" : "java");
const wrapperJar = join(ROOT, "gradle", "wrapper", "gradle-wrapper.jar");
if (!existsSync(javaExe) || !existsSync(wrapperJar)) {
  throw new Error(`找不到 ${javaExe} 或 ${wrapperJar}`);
}

console.log(`JAVA_HOME   = ${javaHome}`);
console.log(`ANDROID_HOME= ${androidHome}`);
console.log(`JAVA        = ${javaExe}`);
if (RELEASE && !existsSync(join(ROOT, "keystore.properties"))) {
  console.warn("提示：未找到 android/keystore.properties，release 包将是无签名的（无法直接安装）。");
}

const result = spawnSync(javaExe, [
  "-classpath", wrapperJar,
  "org.gradle.wrapper.GradleWrapperMain",
  RELEASE ? "assembleRelease" : "assembleDebug", "--no-daemon",
], { cwd: ROOT, env, stdio: "inherit" });
if (result.status !== 0) process.exit(result.status ?? 1);

const apkDir = join(ROOT, "app", "build", "outputs", "apk", RELEASE ? "release" : "debug");
const apkName = RELEASE
  ? (existsSync(join(apkDir, "app-release.apk")) ? "app-release.apk" : "app-release-unsigned.apk")
  : "app-debug.apk";
console.log(`APK: ${join(apkDir, apkName)}`);
