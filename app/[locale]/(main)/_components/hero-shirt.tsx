/**
 * HeroWall — MPC club polo (back view) hanging on a 3D wall.
 *
 * - Polo shape seen from the back: short, wide body, standing orange collar, ribbed orange cuffs.
 * - Near-black fabric (#0b0b0e) with soft lighting: a slight sheen across the shoulder blades,
 *   darker sides, faint vertical fabric streaks — no bright gray patches.
 * - Text never overflows: font sizes are chosen so the natural width already fits the back
 *   (x 60 → 180), and `textLength` locks each line to a fixed width.
 * - 3D: thickness layers + a rotateY sway (keyframes at the bottom of the file) + cast shadow on the wall.
 */

const TRIM = "#ff9a3c";
const TRIM_DARK = "#b85a0a";

// viewBox 240 x 300 — the back (y ≈ 60–150) spans roughly x 58 → 182
const SHIRT_PATH =
  "M92 26 Q120 30 148 26 L186 40 Q212 52 226 104 L198 124 Q190 112 182 100 Q186 170 184 252 Q120 262 56 252 Q54 170 58 100 Q50 112 42 124 L14 104 Q28 52 54 40 Z";
const LEFT_SLEEVE = "M54 40 Q28 52 14 104 L42 124 Q50 112 58 100 Q62 66 54 40 Z";
const RIGHT_SLEEVE = "M186 40 Q212 52 226 104 L198 124 Q190 112 182 100 Q178 66 186 40 Z";

// Thickness layers: front → back
const DEPTH_LAYERS = ["#0a0a0d", "#08080b", "#070709", "#060607", "#050506", "#040405"] as const;
const LAYER_GAP_EM = 0.1;

const ID = "mpc-polo"; // prefix for gradient/filter ids

// Faint vertical fabric streaks
const STREAKS = [70, 82, 95, 108, 121, 134, 147, 160, 172];

function ShirtSilhouette({ fill }: { fill: string }) {
  return (
    <svg aria-hidden className='h-full w-full overflow-visible' role='presentation' viewBox='0 0 240 300'>
      <path d={SHIRT_PATH} fill={fill} />
    </svg>
  );
}

export function ClubShirt() {
  const url = (name: string) => `url(#${ID}-${name})`;

  return (
    <svg className='h-full w-full overflow-visible' role='img' viewBox='0 0 240 300'>
      <title>MPC club polo</title>
      <defs>
        <clipPath id={`${ID}-clip`}>
          <path d={SHIRT_PATH} />
        </clipPath>

        {/* Base fabric: near-black, darker at the sides */}
        <linearGradient id={`${ID}-body`} x1='0' x2='1' y1='0' y2='0'>
          <stop offset='0' stopColor='#030304' />
          <stop offset='0.2' stopColor='#0b0b0e' />
          <stop offset='0.5' stopColor='#15151b' />
          <stop offset='0.8' stopColor='#0b0b0e' />
          <stop offset='1' stopColor='#030304' />
        </linearGradient>

        {/* Soft sheen across the shoulder blades */}
        <radialGradient cx='0.5' cy='0.12' id={`${ID}-sheen`} r='0.55'>
          <stop offset='0' stopColor='#c8cde0' stopOpacity='0.12' />
          <stop offset='0.6' stopColor='#c8cde0' stopOpacity='0.02' />
          <stop offset='1' stopColor='#c8cde0' stopOpacity='0' />
        </radialGradient>

        {/* Bottom falls into shadow */}
        <linearGradient id={`${ID}-fall`} x1='0' x2='0' y1='0' y2='1'>
          <stop offset='0' stopColor='#000' stopOpacity='0' />
          <stop offset='0.55' stopColor='#000' stopOpacity='0.1' />
          <stop offset='1' stopColor='#000' stopOpacity='0.55' />
        </linearGradient>

        {/* Sleeves: lit on top, dark toward the cuff/underarm */}
        <linearGradient id={`${ID}-sleeve-l`} x1='0.8' x2='0.1' y1='0' y2='0.9'>
          <stop offset='0' stopColor='#fff' stopOpacity='0.05' />
          <stop offset='0.5' stopColor='#000' stopOpacity='0.1' />
          <stop offset='1' stopColor='#000' stopOpacity='0.55' />
        </linearGradient>
        <linearGradient id={`${ID}-sleeve-r`} x1='0.2' x2='0.9' y1='0' y2='0.9'>
          <stop offset='0' stopColor='#fff' stopOpacity='0.05' />
          <stop offset='0.5' stopColor='#000' stopOpacity='0.1' />
          <stop offset='1' stopColor='#000' stopOpacity='0.6' />
        </linearGradient>

        {/* Orange trim: collar & cuffs */}
        <linearGradient id={`${ID}-collar`} x1='0' x2='0' y1='0' y2='1'>
          <stop offset='0' stopColor='#ffc06a' />
          <stop offset='0.35' stopColor={TRIM} />
          <stop offset='1' stopColor={TRIM_DARK} />
        </linearGradient>
        <linearGradient id={`${ID}-collar-side`} x1='0' x2='1' y1='0' y2='0'>
          <stop offset='0' stopColor='#000' stopOpacity='0.45' />
          <stop offset='0.18' stopColor='#000' stopOpacity='0' />
          <stop offset='0.82' stopColor='#000' stopOpacity='0' />
          <stop offset='1' stopColor='#000' stopOpacity='0.5' />
        </linearGradient>
        <linearGradient id={`${ID}-cuff`} x1='0' x2='0' y1='0' y2='1'>
          <stop offset='0' stopColor='#ffb14a' />
          <stop offset='1' stopColor={TRIM_DARK} />
        </linearGradient>

        {/* Print */}
        <linearGradient id={`${ID}-title`} x1='0' x2='1' y1='0' y2='0'>
          <stop offset='0' stopColor='#ff5a24' />
          <stop offset='0.5' stopColor='#ff8a34' />
          <stop offset='1' stopColor='#ffb347' />
        </linearGradient>
        <filter height='160%' id={`${ID}-ink`} width='140%' x='-20%' y='-30%'>
          <feDropShadow dx='0' dy='0.5' floodColor='#000' floodOpacity='0.8' stdDeviation='0.35' />
        </filter>

        {/* Orange rim light from the glow behind */}
        <linearGradient id={`${ID}-rim`} x1='0' x2='1' y1='0' y2='0'>
          <stop offset='0' stopColor={TRIM} stopOpacity='0.18' />
          <stop offset='0.25' stopColor={TRIM} stopOpacity='0' />
          <stop offset='0.75' stopColor={TRIM} stopOpacity='0' />
          <stop offset='1' stopColor={TRIM} stopOpacity='0.3' />
        </linearGradient>

        <filter height='200%' id={`${ID}-soft`} width='200%' x='-50%' y='-50%'>
          <feGaussianBlur stdDeviation='2' />
        </filter>
        <filter height='100%' id={`${ID}-grain`} width='100%' x='0' y='0'>
          <feTurbulence baseFrequency='0.9' numOctaves='2' seed='7' type='fractalNoise' />
          <feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.5 -0.2' />
        </filter>
      </defs>

      {/* ---------- Body ---------- */}
      <path d={SHIRT_PATH} fill={url("body")} />

      <g clipPath={url("clip")}>
        {/* ---------- Back print ---------- */}
        <g filter={url("ink")} fontFamily='inherit' textAnchor='middle'>
          <text fill='#e4e4e7' fontSize='7' fontWeight='700' lengthAdjust='spacing' textLength='40' x='120' y='64'>
            EST. 2015
          </text>
          <text fill='#ffb48a' fontSize='10' fontWeight='600' lengthAdjust='spacing' textLength='72' x='120' y='82'>
            MOBILE
          </text>
          <text
            fill={url("title")}
            fontSize='14'
            fontWeight='900'
            lengthAdjust='spacingAndGlyphs'
            textLength='104'
            x='120'
            y='101'
          >
            PROGRAMMING
          </text>
          <path
            d='M70 107 L70 110 L106 110 M170 107 L170 110 L134 110'
            fill='none'
            stroke='#ff6a2b'
            strokeLinejoin='round'
            strokeWidth='1.1'
          />
          <path
            d='M109 107 L106 110 L109 113 M131 107 L134 110 L131 113'
            fill='none'
            stroke='#ff6a2b'
            strokeLinecap='round'
            strokeWidth='1.1'
          />
          <text fill='#ff8a34' fontSize='6.5' fontWeight='700' lengthAdjust='spacing' textLength='20' x='120' y='112.3'>
            CLUB
          </text>
        </g>

        {/* ---------- Lighting & volume (over the print so it gets shaded) ---------- */}
        <path d={LEFT_SLEEVE} fill={url("sleeve-l")} />
        <path d={RIGHT_SLEEVE} fill={url("sleeve-r")} />
        <path d={SHIRT_PATH} fill={url("sheen")} />
        <path d={SHIRT_PATH} fill={url("fall")} />

        {/* Ribbed cuffs (after sleeve shading so they stay vivid) */}
        <path d='M8 99.7 L48 128.3 L53.2 121 L13.2 92.4 Z' fill={url("cuff")} />
        <path d='M232 99.7 L192 128.3 L186.8 121 L226.8 92.4 Z' fill={url("cuff")} />
        <g stroke='#000' strokeOpacity='0.3' strokeWidth='0.5'>
          <path d='M10.6 96 L50.6 124.6' />
          <path d='M229.4 96 L189.4 124.6' />
        </g>

        <path d='M13.2 92.4 L53.2 121' stroke='#000' strokeOpacity='0.35' strokeWidth='1' />
        <path d='M226.8 92.4 L186.8 121' stroke='#000' strokeOpacity='0.35' strokeWidth='1' />
        {/* Fabric streaks + soft folds */}
        <g fill='none' filter={url("soft")} strokeLinecap='round'>
          {STREAKS.map((x, i) => (
            <path
              d={`M${x} ${130 + (i % 3) * 8} Q${x + (i % 2 ? 2 : -2)} 200 ${x} 256`}
              key={x}
              stroke={i % 2 ? "#fff" : "#000"}
              strokeOpacity={i % 2 ? 0.02 : 0.1}
              strokeWidth='3'
            />
          ))}
          <path d='M64 44 Q76 70 68 104' stroke='#000' strokeOpacity='0.3' strokeWidth='4' />
          <path d='M176 44 Q164 70 172 104' stroke='#000' strokeOpacity='0.35' strokeWidth='4' />
        </g>

        {/* Shoulder / sleeve seams */}
        <g fill='none' stroke='#000' strokeOpacity='0.6' strokeWidth='0.8'>
          <path d='M54 40 Q62 66 58 100' />
          <path d='M186 40 Q178 66 182 100' />
        </g>
        <g fill='none' stroke='#fff' strokeOpacity='0.04' strokeWidth='0.6'>
          <path d='M56 41 Q64 66 60 100' />
          <path d='M184 41 Q176 66 180 100' />
        </g>

        {/* Hem stitching */}
        <path
          d='M58 244 Q120 254 182 244'
          fill='none'
          stroke='#fff'
          strokeDasharray='2.5 2'
          strokeOpacity='0.08'
          strokeWidth='0.6'
        />

        <rect filter={url("grain")} height='300' opacity='0.05' style={{ mixBlendMode: "overlay" }} width='240' />
        <path d={SHIRT_PATH} fill='none' stroke={url("rim")} strokeWidth='3' />
      </g>

      {/* ---------- Standing polo collar (back view) ---------- */}
      <path d='M89 28 Q120 33 151 28 L149 11 Q120 15 91 11 Z' fill={url("collar")} />
      <path d='M89 28 Q120 33 151 28 L149 11 Q120 15 91 11 Z' fill={url("collar-side")} />
      {/* Rolled top edge */}
      <path d='M91 11 Q120 15 149 11' fill='none' stroke='#ffd08a' strokeOpacity='0.7' strokeWidth='1' />
      <path d='M91 14 Q120 18 149 14' fill='none' stroke={TRIM_DARK} strokeOpacity='0.5' strokeWidth='0.6' />
      {/* Collar seam onto the body */}
      <path d='M89 28 Q120 33 151 28' fill='none' stroke='#000' strokeOpacity='0.55' strokeWidth='1.2' />
      <path
        d='M90 31 Q120 36 150 31'
        fill='none'
        filter={url("soft")}
        stroke='#000'
        strokeOpacity='0.5'
        strokeWidth='3'
      />
    </svg>
  );
}

function Hanger() {
  return (
    <svg aria-hidden aria-label='Hanger' className='h-full w-full overflow-visible' viewBox='0 0 240 300'>
      <defs>
        <linearGradient id={`${ID}-metal`} x1='0' x2='0' y1='0' y2='1'>
          <stop offset='0' stopColor='#a1a1aa' />
          <stop offset='1' stopColor='#3f3f46' />
        </linearGradient>
      </defs>
      <path
        d='M120 20 L120 4 Q128 -2 128 -8 Q128 -16 120 -16 Q113 -16 113 -10'
        fill='none'
        stroke={`url(#${ID}-metal)`}
        strokeLinecap='round'
        strokeWidth='3'
      />
      <path d='M58 42 L120 20 L182 42' fill='none' stroke='#3f3f46' strokeLinecap='round' strokeWidth='6' />
    </svg>
  );
}

export function HeroWall() {
  return (
    <div
      aria-hidden
      className='transform-3d transform-[translate3d(-50%,-58%,-12em)] absolute top-1/2 left-1/2 h-[40em] w-[78em]'
    >
      {/* Wall */}
      <div className='mask-[radial-gradient(ellipse_at_60%_42%,black_40%,transparent_78%)] absolute inset-0 rounded-[1.2em] bg-[#f4f1ec] dark:bg-[#141417]'>
        <div className='absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-size-[3em_3em] dark:bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)]' />
        <div className='absolute top-[8%] left-[62%] h-[70%] w-[30%] -translate-x-1/2 rounded-full bg-primary/12 blur-[4em] dark:bg-primary/20' />
      </div>

      {/* Cast shadow: a sharp contact shadow and a wide soft one */}
      <div className='absolute top-[11.5%] left-[67%] h-[21em] w-[17em] -translate-x-1/2 opacity-35 blur-[0.3em] motion-safe:animate-[hero-shirt-shadow_7s_ease-in-out_infinite] dark:opacity-90'>
        <ShirtSilhouette fill='#000' />
      </div>
      <div className='absolute top-[14%] left-[68.5%] h-[21em] w-[17em] -translate-x-1/2 opacity-25 blur-[1.4em] motion-safe:animate-[hero-shirt-shadow_7s_ease-in-out_infinite] dark:opacity-60'>
        <ShirtSilhouette fill='#000' />
      </div>

      {/* Wall pin */}
      <span className='transform-[translateZ(0.4em)] absolute top-[5%] left-[66%] h-[0.8em] w-[0.8em] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_35%_30%,#a1a1aa,#27272a)] shadow-[0_0.15em_0.35em_rgba(0,0,0,0.8)]' />

      {/* Shirt */}
      <div className='transform-3d transform-[translateZ(2.2em)] absolute top-[9%] left-[66%] h-[21em] w-[17em] -translate-x-1/2'>
        <div className='transform-3d absolute inset-0 origin-[50%_0%] motion-safe:animate-[hero-shirt-sway_7s_ease-in-out_infinite]'>
          {DEPTH_LAYERS.map((fill, i) => (
            <div
              className='absolute inset-0'
              key={fill}
              style={{ transform: `translateZ(${-(i + 1) * LAYER_GAP_EM}em)` }}
            >
              <ShirtSilhouette fill={fill} />
            </div>
          ))}
          <div className='absolute inset-0 [transform:translateZ(-0.35em)]'>
            <Hanger />
          </div>
          <div className='absolute inset-0'>
            <ClubShirt />
          </div>
        </div>
      </div>
    </div>
  );
}
