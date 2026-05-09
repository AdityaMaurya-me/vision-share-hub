export type GearType = "camera" | "lens" | "phone" | "drone" | "lighting" | "tripod" | "audio" | "accessory" | "other";

export const GEAR_TYPES: { value: GearType; label: string }[] = [
  { value: "camera", label: "Camera Body" },
  { value: "lens", label: "Lens" },
  { value: "phone", label: "Phone" },
  { value: "drone", label: "Drone" },
  { value: "lighting", label: "Lighting" },
  { value: "tripod", label: "Tripod / Rig" },
  { value: "audio", label: "Audio" },
  { value: "accessory", label: "Accessory" },
  { value: "other", label: "Other" },
];

export const slugify = (s: string): string =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

export const guessGearType = (name: string): GearType => {
  const n = name.toLowerCase();
  if (/\bmm\b|f\/?\d|prime|zoom|macro|telephoto|wide/.test(n)) return "lens";
  if (/iphone|pixel|galaxy|oneplus|xiaomi/.test(n)) return "phone";
  if (/drone|mavic|dji air|inspire/.test(n)) return "drone";
  if (/light|godox|aputure|softbox|flash|strobe/.test(n)) return "lighting";
  if (/tripod|gimbal|rig|stabilizer|monopod/.test(n)) return "tripod";
  if (/mic\b|microphone|audio|wireless go|rode/.test(n)) return "audio";
  if (/sony|canon|nikon|fuji|leica|hasselblad|panasonic|olympus|blackmagic|red\b|a7|x-t|z\d|r\d/.test(n)) return "camera";
  return "accessory";
};

/** Parse a legacy "Body + Lens" gear string into ordered items */
export const parseLegacyGear = (gear: string): { name: string; type: GearType }[] => {
  if (!gear) return [];
  return gear.split(/\s*\+\s*/).map((part) => {
    const name = part.trim();
    return { name, type: guessGearType(name) };
  });
};
