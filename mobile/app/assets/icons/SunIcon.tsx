import Svg, { Circle, Line } from 'react-native-svg';

interface IconProps {
  size: number;
  color: string;
}

export default function SunIcon({ size, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="12" cy="12" r="4" fill={color} />
      {[
        ['12', '2', '12', '5'],
        ['12', '19', '12', '22'],
        ['2', '12', '5', '12'],
        ['19', '12', '22', '12'],
        ['4.93', '4.93', '6.7', '6.7'],
        ['17.3', '17.3', '19.07', '19.07'],
        ['4.93', '19.07', '6.7', '17.3'],
        ['17.3', '6.7', '19.07', '4.93'],
      ].map(([x1, y1, x2, y2], i) => (
        <Line
          key={i}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
        />
      ))}
    </Svg>
  );
}
