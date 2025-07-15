
<old_str>
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
</old_str>
<new_str>
{ pkgs }: {
  deps = [
    pkgs.nodejs-18_x
    pkgs.openjdk17
    pkgs.android-tools
    pkgs.wget
    pkgs.unzip
  ];
  
  env = {
    ANDROID_HOME = "${pkgs.android-tools}/share/android-sdk";
    ANDROID_SDK_ROOT = "${pkgs.android-tools}/share/android-sdk";
    JAVA_HOME = "${pkgs.openjdk17}/lib/openjdk";
  };
}
</new_str>
