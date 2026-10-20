import { Building2 } from "lucide-react";

export default function SmartCityMark() {
  return (
    <div className="smart-city-mark">
      <div className="smart-city-logo" aria-hidden="true">
        <Building2 size={20} strokeWidth={1.8} />
        <span />
      </div>
      <p>Smart City</p>
    </div>
  );
}
