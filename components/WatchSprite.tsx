// Shared symbol sprite for every watch design. Colors come from CSS variables
// (--case, --bezel, --dial, --strap, --mark, --acc) set on the <svg> that uses a symbol.
export default function WatchSprite() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
      <defs>
        <symbol id="w-dress" viewBox="0 0 200 260">
              <path d="M74 0H126L122 96H78Z" fill="var(--strap)"/>
              <path d="M78 164H122L126 260H74Z" fill="var(--strap)"/>
              <path d="M81 6L83 90M119 6L117 90M83 170L81 254M117 170L119 254" stroke="#000" strokeOpacity=".28" strokeWidth="1.2" strokeDasharray="3 3" fill="none"/>
              <rect x="70" y="66" width="12" height="28" rx="5" fill="var(--case)"/>
              <rect x="118" y="66" width="12" height="28" rx="5" fill="var(--case)"/>
              <rect x="70" y="166" width="12" height="28" rx="5" fill="var(--case)"/>
              <rect x="118" y="166" width="12" height="28" rx="5" fill="var(--case)"/>
              <rect x="161" y="122" width="9" height="16" rx="2.5" fill="var(--case)"/>
              <circle cx="100" cy="130" r="63" fill="var(--case)"/>
              <circle cx="100" cy="130" r="55" fill="var(--bezel)"/>
              <circle cx="100" cy="130" r="52" fill="var(--dial)"/>
              <circle cx="100" cy="130" r="44" fill="none" stroke="var(--mark)" strokeWidth="7" strokeDasharray="2.2 20.84" strokeDashoffset="1.1"/>
              <circle cx="100" cy="130" r="44" fill="none" stroke="var(--mark)" strokeWidth="10" strokeDasharray="4 65.12" strokeDashoffset="2"/>
              <text x="100" y="110" textAnchor="middle" fontSize="5.6" letterSpacing="1.4" fill="var(--mark)">HOURWRIGHT</text>
              <text x="100" y="158" textAnchor="middle" fontSize="4.2" letterSpacing="1.2" fill="var(--mark)" fillOpacity=".7">AUTOMATIC</text>
              <g transform="rotate(-55 100 130)"><rect x="97.5" y="98" width="5" height="36" rx="2.5" fill="var(--mark)"/></g>
              <g transform="rotate(60 100 130)"><rect x="98.5" y="82" width="3" height="52" rx="1.5" fill="var(--mark)"/></g>
              <g transform="rotate(150 100 130)"><rect x="99.4" y="80" width="1.2" height="62" fill="var(--acc)"/></g>
              <circle cx="100" cy="130" r="3.5" fill="var(--acc)"/>
              <path d="M52 112A50 50 0 0 1 98 80" stroke="#fff" strokeOpacity=".2" strokeWidth="3" fill="none" strokeLinecap="round"/>
            </symbol>
            <symbol id="w-diver" viewBox="0 0 200 260">
              <path d="M72 0H128L124 96H76Z" fill="var(--strap)"/>
              <path d="M76 164H124L128 260H72Z" fill="var(--strap)"/>
              <path d="M72 24H128M74 48H126M75 72H125M75 188H125M74 212H126M72 236H128" stroke="#000" strokeOpacity=".25" strokeWidth="1.4" fill="none"/>
              <rect x="68" y="64" width="14" height="30" rx="5" fill="var(--case)"/>
              <rect x="118" y="64" width="14" height="30" rx="5" fill="var(--case)"/>
              <rect x="68" y="166" width="14" height="30" rx="5" fill="var(--case)"/>
              <rect x="118" y="166" width="14" height="30" rx="5" fill="var(--case)"/>
              <rect x="160" y="120" width="11" height="20" rx="3" fill="var(--case)"/>
              <circle cx="100" cy="130" r="65" fill="var(--case)"/>
              <circle cx="100" cy="130" r="61" fill="var(--bezel)"/>
              <circle cx="100" cy="130" r="56" fill="none" stroke="var(--mark)" strokeOpacity=".85" strokeWidth="5" strokeDasharray="1 4.864" strokeDashoffset=".5"/>
              <circle cx="100" cy="130" r="47" fill="var(--dial)"/>
              <circle cx="100" cy="130" r="36" fill="none" stroke="var(--mark)" strokeWidth="7" strokeLinecap="round" strokeDasharray="0.01 18.84"/>
              <path d="M100 82L93.5 97H106.5Z" fill="var(--mark)"/>
              <rect x="130" y="125" width="11" height="10" fill="var(--mark)" fillOpacity=".92"/>
              <text x="100" y="162" textAnchor="middle" fontSize="4.6" letterSpacing="1.2" fill="var(--mark)">DIVER 300M</text>
              <g transform="rotate(-55 100 130)"><rect x="96.5" y="102" width="7" height="32" rx="2" fill="var(--mark)"/></g>
              <g transform="rotate(60 100 130)"><rect x="97.5" y="88" width="5" height="46" rx="2" fill="var(--mark)"/></g>
              <g transform="rotate(150 100 130)"><rect x="99.3" y="86" width="1.4" height="56" fill="var(--acc)"/><circle cx="100" cy="96" r="3" fill="var(--acc)"/></g>
              <circle cx="100" cy="130" r="3.5" fill="var(--acc)"/>
              <path d="M50 108A54 54 0 0 1 96 76" stroke="#fff" strokeOpacity=".16" strokeWidth="3" fill="none" strokeLinecap="round"/>
            </symbol>
            <symbol id="w-chrono" viewBox="0 0 200 260">
              <path d="M74 0H126L122 96H78Z" fill="var(--strap)"/>
              <path d="M78 164H122L126 260H74Z" fill="var(--strap)"/>
              <path d="M81 6L83 90M119 6L117 90M83 170L81 254M117 170L119 254" stroke="#000" strokeOpacity=".28" strokeWidth="1.2" strokeDasharray="3 3" fill="none"/>
              <rect x="70" y="66" width="12" height="28" rx="5" fill="var(--case)"/>
              <rect x="118" y="66" width="12" height="28" rx="5" fill="var(--case)"/>
              <rect x="70" y="166" width="12" height="28" rx="5" fill="var(--case)"/>
              <rect x="118" y="166" width="12" height="28" rx="5" fill="var(--case)"/>
              <rect x="160" y="96" width="8" height="12" rx="2" fill="var(--case)"/>
              <rect x="160" y="152" width="8" height="12" rx="2" fill="var(--case)"/>
              <rect x="161" y="122" width="9" height="16" rx="2.5" fill="var(--case)"/>
              <circle cx="100" cy="130" r="64" fill="var(--case)"/>
              <circle cx="100" cy="130" r="58" fill="var(--bezel)"/>
              <circle cx="100" cy="130" r="54" fill="none" stroke="var(--mark)" strokeOpacity=".8" strokeWidth="4" strokeDasharray="0.8 4.855"/>
              <circle cx="100" cy="130" r="48" fill="var(--dial)"/>
              <circle cx="100" cy="130" r="43" fill="none" stroke="var(--mark)" strokeOpacity=".7" strokeWidth="3" strokeDasharray="0.9 3.6"/>
              <circle cx="100" cy="130" r="38" fill="none" stroke="var(--mark)" strokeWidth="6" strokeDasharray="3 17.68" strokeDashoffset="1.5"/>
              <circle cx="80" cy="128" r="11" fill="none" stroke="var(--mark)" strokeOpacity=".7" strokeWidth="1"/>
              <circle cx="120" cy="128" r="11" fill="none" stroke="var(--mark)" strokeOpacity=".7" strokeWidth="1"/>
              <circle cx="100" cy="150" r="10" fill="none" stroke="var(--mark)" strokeOpacity=".7" strokeWidth="1"/>
              <path d="M80 128V119M120 128L126 123M100 150V158" stroke="var(--acc)" strokeWidth="1.4" strokeLinecap="round"/>
              <text x="100" y="104" textAnchor="middle" fontSize="4.8" letterSpacing="1.3" fill="var(--mark)">CHRONOGRAPH</text>
              <g transform="rotate(-55 100 130)"><rect x="97.5" y="98" width="5" height="36" rx="2" fill="var(--mark)"/></g>
              <g transform="rotate(60 100 130)"><rect x="98.5" y="84" width="3" height="50" rx="1.5" fill="var(--mark)"/></g>
              <g transform="rotate(150 100 130)"><rect x="99.4" y="82" width="1.2" height="60" fill="var(--acc)"/></g>
              <circle cx="100" cy="130" r="3.5" fill="var(--acc)"/>
              <path d="M50 110A52 52 0 0 1 96 78" stroke="#fff" strokeOpacity=".18" strokeWidth="3" fill="none" strokeLinecap="round"/>
            </symbol>
            <symbol id="w-field" viewBox="0 0 200 260">
              <path d="M76 0H124L121 96H79Z" fill="var(--strap)"/>
              <path d="M79 164H121L124 260H76Z" fill="var(--strap)"/>
              <path d="M82 6L84 90M118 6L116 90M84 170L82 254M116 170L118 254" stroke="#000" strokeOpacity=".28" strokeWidth="1.2" strokeDasharray="3 3" fill="none"/>
              <rect x="72" y="68" width="11" height="26" rx="5" fill="var(--case)"/>
              <rect x="117" y="68" width="11" height="26" rx="5" fill="var(--case)"/>
              <rect x="72" y="166" width="11" height="26" rx="5" fill="var(--case)"/>
              <rect x="117" y="166" width="11" height="26" rx="5" fill="var(--case)"/>
              <rect x="160" y="123" width="8" height="14" rx="2" fill="var(--case)"/>
              <circle cx="100" cy="130" r="62" fill="var(--case)"/>
              <circle cx="100" cy="130" r="57" fill="var(--bezel)"/>
              <circle cx="100" cy="130" r="53" fill="var(--dial)"/>
              <circle cx="100" cy="130" r="49" fill="none" stroke="var(--mark)" strokeOpacity=".55" strokeWidth="1"/>
              <circle cx="100" cy="130" r="45" fill="none" stroke="var(--mark)" strokeOpacity=".55" strokeWidth="3" strokeDasharray="0.7 3.4"/>
              <circle cx="100" cy="130" r="40" fill="none" stroke="var(--mark)" strokeWidth="4" strokeLinecap="round" strokeDasharray="0.01 20.9"/>
              <g fontFamily="Georgia, 'Times New Roman', serif" fontWeight="700" fontSize="15" fill="var(--mark)" textAnchor="middle" dominantBaseline="central">
                <text x="100" y="101">12</text>
                <text x="145" y="130">3</text>
                <text x="100" y="160">6</text>
                <text x="55" y="130">9</text>
              </g>
              <g transform="rotate(-55 100 130)"><path d="M100 98L103 106V134H97V106Z" fill="var(--mark)"/></g>
              <g transform="rotate(60 100 130)"><path d="M100 84L102.2 92V134H97.8V92Z" fill="var(--mark)"/></g>
              <g transform="rotate(150 100 130)"><rect x="99.4" y="84" width="1.2" height="58" fill="var(--acc)"/></g>
              <circle cx="100" cy="130" r="3.5" fill="var(--acc)"/>
              <path d="M52 112A50 50 0 0 1 98 80" stroke="#fff" strokeOpacity=".18" strokeWidth="3" fill="none" strokeLinecap="round"/>
            </symbol>
            <symbol id="w-cushion" viewBox="0 0 200 260">
              <path d="M76 0H124L121 90H79Z" fill="var(--strap)"/>
              <path d="M79 170H121L124 260H76Z" fill="var(--strap)"/>
              <path d="M82 6L84 84M118 6L116 84M84 176L82 254M116 176L118 254" stroke="#000" strokeOpacity=".28" strokeWidth="1.2" strokeDasharray="3 3" fill="none"/>
              <rect x="72" y="60" width="12" height="22" rx="5" fill="var(--case)"/>
              <rect x="116" y="60" width="12" height="22" rx="5" fill="var(--case)"/>
              <rect x="72" y="178" width="12" height="22" rx="5" fill="var(--case)"/>
              <rect x="116" y="178" width="12" height="22" rx="5" fill="var(--case)"/>
              <rect x="160" y="122" width="9" height="16" rx="2.5" fill="var(--case)"/>
              <rect x="38" y="68" width="124" height="124" rx="30" fill="var(--case)"/>
              <rect x="44" y="74" width="112" height="112" rx="25" fill="var(--bezel)"/>
              <rect x="50" y="80" width="100" height="100" rx="20" fill="var(--dial)"/>
              <g fill="var(--mark)">
                <rect x="97" y="88" width="6" height="12" rx="1"/>
                <rect x="97" y="160" width="6" height="12" rx="1"/>
                <rect x="132" y="127" width="12" height="6" rx="1"/>
                <rect x="56" y="127" width="12" height="6" rx="1"/>
                <circle cx="76" cy="106" r="2.5"/><circle cx="124" cy="106" r="2.5"/>
                <circle cx="76" cy="154" r="2.5"/><circle cx="124" cy="154" r="2.5"/>
              </g>
              <text x="100" y="116" textAnchor="middle" fontSize="5" letterSpacing="1.4" fill="var(--mark)">HOURWRIGHT</text>
              <g transform="rotate(-55 100 130)"><rect x="97.5" y="100" width="5" height="34" rx="2" fill="var(--mark)"/></g>
              <g transform="rotate(60 100 130)"><rect x="98.5" y="86" width="3" height="48" rx="1.5" fill="var(--mark)"/></g>
              <circle cx="100" cy="130" r="3.5" fill="var(--acc)"/>
              <path d="M58 100Q62 88 80 86" stroke="#fff" strokeOpacity=".2" strokeWidth="3" fill="none" strokeLinecap="round"/>
            </symbol>
      </defs>
    </svg>
  );
}
