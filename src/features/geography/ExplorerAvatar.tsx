import { View } from 'react-native';
import Svg, { Circle, ClipPath, Defs, Ellipse, G, Line, Path, Rect } from 'react-native-svg';
import { explorerColors, type ExplorerAppearance, type ExplorerId } from './explorer';

/** Bundled vector portrait. Accessories follow earned stages; no remote avatar service. */
export function ExplorerAvatar({ explorer, appearance, stage, size = 160, label }: {
  explorer: ExplorerId; appearance?: ExplorerAppearance; stage: number; size?: number; label: string;
}) {
  const p = explorerColors(explorer, appearance);
  return <View accessible accessibilityRole="image" accessibilityLabel={label} style={{ width: size, height: size }}>
    <Svg width={size} height={size} viewBox="0 0 200 200" aria-hidden={true}>
      <Defs><ClipPath id="avatar-scenery-clip"><Circle cx={100} cy={100} r={97} /></ClipPath></Defs>
      <Circle cx={100} cy={100} r={97} fill={p.sky} />
      <G clipPath="url(#avatar-scenery-clip)">
      <Path d="M10 147Q40 108 68 142T129 140T193 147V173H10Z" fill="#FFFFFF" opacity={0.55} />
      <Circle cx={151} cy={40} r={13} fill="#FFF" opacity={0.7} />
      <Path d="M22 75Q38 50 49 70" fill="none" stroke="#97B9BC" strokeWidth={2} strokeDasharray="3 5" />
      </G>
      {explorer === 'ocean' && <Path d="M61 90Q48 130 71 143H132Q151 122 139 85Z" fill={p.hair} />}
      {stage >= 2 && <><Rect x={40} y={133} width={35} height={54} rx={13} fill={p.accent} /><Rect x={126} y={133} width={35} height={54} rx={13} fill={p.accent} /></>}
      <Path d="M34 190L43 161Q50 137 84 134H116Q150 137 157 161L166 190Q100 211 34 190Z" fill={p.shirt} />
      <Rect x={88} y={114} width={24} height={33} rx={9} fill={p.skin} />
      <Path d="M81 137Q100 157 119 137" fill="none" stroke="#FFFFFF" strokeWidth={5} opacity={0.7} />
      <Path d="M60 91V68Q61 30 100 31Q141 31 142 71V96Z" fill={p.hair} />
      <Circle cx={64} cy={88} r={8} fill={p.skin} /><Circle cx={136} cy={88} r={8} fill={p.skin} />
      <Ellipse cx={100} cy={85} rx={35} ry={43} fill={p.skin} />
      <Path d="M65 74Q68 40 102 39Q129 38 136 67Q117 63 108 49Q95 70 65 74Z" fill={p.hair} />
      {explorer === 'forest' && <><Circle cx={71} cy={51} r={12} fill={p.hair} /><Circle cx={88} cy={42} r={13} fill={p.hair} /><Circle cx={110} cy={42} r={14} fill={p.hair} /><Circle cx={128} cy={54} r={12} fill={p.hair} /></>}
      <Path d="M79 77Q86 73 92 77M108 77Q115 73 122 77" fill="none" stroke={p.hair} strokeWidth={3} strokeLinecap="round" />
      <Ellipse cx={86} cy={86} rx={5} ry={4} fill="#FFF" /><Ellipse cx={114} cy={86} rx={5} ry={4} fill="#FFF" />
      {[86, 114].map(x => <G key={x}><Circle cx={x} cy={86} r={3.2} fill={p.eyes} /><Circle cx={x} cy={86} r={1.5} fill="#192330" /><Circle cx={x - 0.8} cy={85} r={0.7} fill="#FFF" /></G>)}
      <Path d="M100 88L97 98H102" fill="none" stroke="#9A6650" strokeWidth={2} strokeLinecap="round" />
      <Path d="M88 105Q100 117 112 105" fill="#FFF" stroke="#855B4C" strokeWidth={1.5} strokeLinejoin="round" />
      {stage >= 1 && stage < 4 && <><Path d="M61 63Q64 28 100 28Q133 28 139 63Z" fill={p.accent} /><Path d="M58 61Q104 50 145 62L143 68Q99 60 58 68Z" fill={p.shirt} /><Circle cx={101} cy={45} r={7} fill="#FFF" opacity={0.8} /></>}
      {stage >= 2 && <><Path d="M68 142L63 187M132 142L137 187" stroke={p.accent} strokeWidth={9} /><Rect x={58} y={158} width={11} height={6} rx={2} fill="#F6F0D7" /><Rect x={132} y={158} width={11} height={6} rx={2} fill="#F6F0D7" /></>}
      {stage >= 3 && <><Path d="M85 136L78 147L93 157L100 145L107 157L122 147L115 136" fill="#F5E9D2" /><Line x1={100} y1={146} x2={100} y2={174} stroke="#D8B56F" strokeWidth={2} /><Circle cx={100} cy={175} r={10} fill="#FAF4D9" stroke={p.accent} strokeWidth={3} /><Path d="M100 168L104 177L100 175L96 182Z" fill="#D55F52" /></>}
      {stage >= 4 && <><Path d="M65 59L73 29Q100 23 127 29L137 59Z" fill="#E2CB8F" /><Path d="M65 52H137V61H65Z" fill="#805F3A" /><Ellipse cx={101} cy={64} rx={54} ry={8} fill="#E2CB8F" /><Path d="M127 161L130 167L137 168L132 173L133 180L127 176L121 180L122 173L117 168L124 167Z" fill="#FFE08A" stroke="#B98A2D" strokeWidth={1.5} /></>}
    </Svg>
  </View>;
}
