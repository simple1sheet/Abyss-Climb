{ pkgs }: {
  deps = [
    pkgs.nodejs_20
    pkgs.nodePackages.typescript
    pkgs.nodePackages.tsx
    pkgs.openjdk17
  ];
  env = {
    JAVA_HOME = "${pkgs.openjdk17}/lib/openjdk";
  };
}