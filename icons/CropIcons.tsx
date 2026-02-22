import React from "react";

type IconProps = {
  size?: number;
};

const BaseIcon = ({ size = 48, color }: IconProps & { color: string }) => (
  <svg width={size} height={size} viewBox="0 0 64 64">
    <circle
      cx="32"
      cy="34"
      r="18"
      fill={color}
      stroke="#000000"
      strokeWidth="2"
    />
    <ellipse
      cx="28"
      cy="40"
      rx="12"
      ry="8"
      fill="#000000"
      opacity="0.15"
    />
    <rect
      x="28"
      y="14"
      width="8"
      height="8"
      rx="2"
      fill="#2E7D32"
      stroke="#000000"
      strokeWidth="2"
    />
  </svg>
);

export const CropIcons = {
  tomates: (props: IconProps) => <BaseIcon {...props} color="#C62828" />,
  courgettes: (props: IconProps) => <BaseIcon {...props} color="#2E7D32" />,
  aubergines: (props: IconProps) => <BaseIcon {...props} color="#6A1B9A" />,
  poivrons: (props: IconProps) => <BaseIcon {...props} color="#F9A825" />,
  courges: (props: IconProps) => <BaseIcon {...props} color="#F9A825" />,
  patisson: (props: IconProps) => <BaseIcon {...props} color="#F9A825" />,
  carottes: (props: IconProps) => <BaseIcon {...props} color="#F9A825" />,
  radis: (props: IconProps) => <BaseIcon {...props} color="#C62828" />,
  betterave: (props: IconProps) => <BaseIcon {...props} color="#8E1B1B" />,
  pdt: (props: IconProps) => <BaseIcon {...props} color="#5D4037" />,
  oignons: (props: IconProps) => <BaseIcon {...props} color="#F9A825" />,
  ail: (props: IconProps) => <BaseIcon {...props} color="#EEEEEE" />,
  salades: (props: IconProps) => <BaseIcon {...props} color="#66BB6A" />,
  epinards: (props: IconProps) => <BaseIcon {...props} color="#2E7D32" />,
  choux: (props: IconProps) => <BaseIcon {...props} color="#66BB6A" />,
  choux_bruxelles: (props: IconProps) => <BaseIcon {...props} color="#2E7D32" />,
  poireaux: (props: IconProps) => <BaseIcon {...props} color="#66BB6A" />,
  haricots: (props: IconProps) => <BaseIcon {...props} color="#2E7D32" />,
  pois: (props: IconProps) => <BaseIcon {...props} color="#66BB6A" />,
  artichaut: (props: IconProps) => <BaseIcon {...props} color="#6A1B9A" />,
  rhubarbe: (props: IconProps) => <BaseIcon {...props} color="#C62828" />,
  asperge: (props: IconProps) => <BaseIcon {...props} color="#2E7D32" />,
  fraise: (props: IconProps) => <BaseIcon {...props} color="#C62828" />,
  framboise: (props: IconProps) => <BaseIcon {...props} color="#C62828" />,
  basilic: (props: IconProps) => <BaseIcon {...props} color="#2E7D32" />,
  menthe: (props: IconProps) => <BaseIcon {...props} color="#66BB6A" />,
  pommier: (props: IconProps) => <BaseIcon {...props} color="#C62828" />,
  poirier: (props: IconProps) => <BaseIcon {...props} color="#66BB6A" />,
};
