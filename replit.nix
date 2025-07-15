
{ pkgs }: {
  deps = [
    pkgs.nodejs-18_x
    pkgs.openjdk17
    pkgs.android-studio
  ];
  
  env = {
    ANDROID_HOME = "${pkgs.android-studio}/libexec/android-studio/sdk";
    ANDROID_SDK_ROOT = "${pkgs.android-studio}/libexec/android-studio/sdk";
  };
}
