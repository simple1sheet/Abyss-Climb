
{ pkgs }: {
  deps = [
    pkgs.nodejs-18_x
    pkgs.openjdk17
    pkgs.android-tools
  ];
  
  env = {
    ANDROID_HOME = "/opt/android-sdk";
    ANDROID_SDK_ROOT = "/opt/android-sdk";
  };
}
