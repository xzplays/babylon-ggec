export type OpenAssetLicense = "CC0" | "MIT" | "Apache-2.0" | "BSD" | "FreeCommercial";

export type AssetLicenseRecord = {
  assetId: string;
  displayName: string;
  localPath?: string;
  remoteSourceUrl?: string;
  license: OpenAssetLicense;
  licenseUrl: string;
  authorSource: string;
  allowedCommercialUse: boolean;
  attributionRequired: boolean;
  notes: string;
};

export const licenseRegistry: AssetLicenseRecord[] = [
  { assetId: "quaternius-lowpoly-animated-people", displayName: "Quaternius animated people packs", localPath: "/assets/models/people/", remoteSourceUrl: "https://quaternius.com/", license: "CC0", licenseUrl: "https://quaternius.com/faq.html", authorSource: "Quaternius", allowedCommercialUse: true, attributionRequired: false, notes: "Place CC0 animated humanoid .glb files here and update assetManifest paths." },
  { assetId: "kenney-car-kit", displayName: "Kenney Car Kit / City Kit vehicles", localPath: "/assets/models/vehicles/", remoteSourceUrl: "https://kenney.nl/assets", license: "CC0", licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/", authorSource: "Kenney", allowedCommercialUse: true, attributionRequired: false, notes: "Use only individual Kenney asset pages marked Creative Commons CC0." },
  { assetId: "kenney-city-kit", displayName: "Kenney city, roads and street furniture", localPath: "/assets/models/city/", remoteSourceUrl: "https://kenney.nl/assets", license: "CC0", licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/", authorSource: "Kenney", allowedCommercialUse: true, attributionRequired: false, notes: "Optional replacements for bus stops, lamps, signs, trees and modular buildings." },
  { assetId: "polyhaven-cc0-textures", displayName: "Poly Haven CC0 textures/HDRIs", localPath: "/assets/textures/", remoteSourceUrl: "https://polyhaven.com/license", license: "CC0", licenseUrl: "https://polyhaven.com/license", authorSource: "Poly Haven", allowedCommercialUse: true, attributionRequired: false, notes: "Use for pavement, asphalt, facade and sky texture upgrades." },
  { assetId: "khronos-sample-models-approved", displayName: "Khronos glTF sample models with per-model permissive README", localPath: "/assets/models/city/", remoteSourceUrl: "https://github.com/KhronosGroup/glTF-Sample-Assets", license: "FreeCommercial", licenseUrl: "https://github.com/KhronosGroup/glTF-Sample-Assets", authorSource: "KhronosGroup / listed model authors", allowedCommercialUse: true, attributionRequired: true, notes: "Do not assume the full repo is usable; verify each model directory README/license before use." }
];

export const isPermittedCommercialAsset = (assetId: string) => licenseRegistry.some(a => a.assetId === assetId && a.allowedCommercialUse);
