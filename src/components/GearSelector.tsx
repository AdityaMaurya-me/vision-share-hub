import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type DeviceType = "smartphone" | "dslr" | "action_cam" | "360_camera" | "";

const smartphoneBrands = [
  "Apple iPhone",
  "Samsung Galaxy",
  "Google Pixel",
  "OnePlus",
  "Xiaomi",
  "Huawei",
  "Sony Xperia",
  "Other",
];

const dslrBrands = [
  "Canon",
  "Nikon",
  "Sony",
  "Fujifilm",
  "Panasonic",
  "Olympus",
  "Leica",
  "Pentax",
  "Other",
];

const actionCamBrands = [
  "GoPro",
  "DJI",
  "Insta360",
  "Sony",
  "Akaso",
  "Other",
];

const threeSixtyCamBrands = [
  "Insta360",
  "Ricoh Theta",
  "GoPro MAX",
  "Kandao",
  "Other",
];

interface GearSelectorProps {
  onGearChange: (gear: string) => void;
  onSettingsChange: (settings: {
    aperture: string;
    shutterSpeed: string;
    iso: string;
  }) => void;
  aperture: string;
  shutterSpeed: string;
  iso: string;
}

const GearSelector = ({
  onGearChange,
  onSettingsChange,
  aperture,
  shutterSpeed,
  iso,
}: GearSelectorProps) => {
  const [deviceType, setDeviceType] = useState<DeviceType>("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [lensInfo, setLensInfo] = useState("");

  useEffect(() => {
    let gear = "";
    if (brand && brand !== "Other") {
      gear = model ? `${brand} ${model}` : brand;
    } else if (brand === "Other" && model) {
      gear = model;
    }
    if (lensInfo && (deviceType === "dslr")) {
      gear += gear ? ` + ${lensInfo}` : lensInfo;
    }
    onGearChange(gear);
  }, [brand, model, lensInfo, deviceType]);

  const handleDeviceChange = (val: string) => {
    setDeviceType(val as DeviceType);
    setBrand("");
    setModel("");
    setLensInfo("");
  };

  const getBrands = () => {
    switch (deviceType) {
      case "smartphone": return smartphoneBrands;
      case "dslr": return dslrBrands;
      case "action_cam": return actionCamBrands;
      case "360_camera": return threeSixtyCamBrands;
      default: return [];
    }
  };

  return (
    <div className="space-y-4">
      {/* Device Type */}
      <div className="space-y-2">
        <Label>Device Type</Label>
        <Select value={deviceType} onValueChange={handleDeviceChange}>
          <SelectTrigger className="bg-secondary border-border">
            <SelectValue placeholder="What did you shoot with?" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="smartphone">📱 Smartphone</SelectItem>
            <SelectItem value="dslr">📷 DSLR / Mirrorless</SelectItem>
            <SelectItem value="action_cam">🎬 Action Camera</SelectItem>
            <SelectItem value="360_camera">🌐 360° Camera</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Brand */}
      {deviceType && (
        <div className="space-y-2">
          <Label>Brand</Label>
          <Select value={brand} onValueChange={(v) => { setBrand(v); setModel(""); }}>
            <SelectTrigger className="bg-secondary border-border">
              <SelectValue placeholder="Select brand" />
            </SelectTrigger>
            <SelectContent>
              {getBrands().map((b) => (
                <SelectItem key={b} value={b}>{b}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Model */}
      {brand && (
        <div className="space-y-2">
          <Label>{brand === "Other" ? "Device Name" : "Model"}</Label>
          <Input
            placeholder={
              deviceType === "smartphone"
                ? "e.g. iPhone 16 Pro Max"
                : deviceType === "dslr"
                ? "e.g. A7 IV, EOS R5"
                : "e.g. Hero 13 Black"
            }
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="bg-secondary border-border"
          />
        </div>
      )}

      {/* Lens info for DSLR */}
      {deviceType === "dslr" && brand && (
        <div className="space-y-2">
          <Label>Lens</Label>
          <Input
            placeholder="e.g. 85mm f/1.4 GM"
            value={lensInfo}
            onChange={(e) => setLensInfo(e.target.value)}
            className="bg-secondary border-border"
          />
        </div>
      )}

      {/* Camera settings for DSLR */}
      {deviceType === "dslr" && brand && (
        <div className="space-y-2">
          <Label>Camera Settings</Label>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label htmlFor="aperture" className="text-xs text-muted-foreground">Aperture</Label>
              <Input
                id="aperture"
                placeholder="f/2.8"
                value={aperture}
                onChange={(e) => onSettingsChange({ aperture: e.target.value, shutterSpeed, iso })}
                className="bg-secondary border-border"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="shutter" className="text-xs text-muted-foreground">Shutter Speed</Label>
              <Input
                id="shutter"
                placeholder="1/250"
                value={shutterSpeed}
                onChange={(e) => onSettingsChange({ aperture, shutterSpeed: e.target.value, iso })}
                className="bg-secondary border-border"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="iso" className="text-xs text-muted-foreground">ISO</Label>
              <Input
                id="iso"
                placeholder="100"
                value={iso}
                onChange={(e) => onSettingsChange({ aperture, shutterSpeed, iso: e.target.value })}
                className="bg-secondary border-border"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Format: Aperture as f/X.X · Shutter as 1/XXX · ISO as a number
          </p>
        </div>
      )}
    </div>
  );
};

export default GearSelector;
