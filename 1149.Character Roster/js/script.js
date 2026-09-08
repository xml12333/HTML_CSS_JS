const paths = {
  HUNT: {
    label: 'The Hunt',
    members: ['Seele', 'Bronya', 'Dan Heng', 'Sushang'],
    chars: {
      Seele: {
        num: '01',
        emoji: '🦋',
        portrait: '',   // portrait URL here
        thumb:   '',    // thumbnail URL here
        title: 'Butterfly in the Dark',
        element: 'Quantum', rarity: '5★',
        path: 'The Hunt', faction: 'Wildfire',
        stats: [
          { l: 'ATK', v: 82, c: '#c060ff' },
          { l: 'SPD', v: 95, c: '#4ab3e0' },
          { l: 'DEF', v: 38, c: '#60c0a0' },
          { l: 'Res',  v: 55, c: '#e08040' }
        ],
        desc: 'A young woman of the Wildfire, Seele fights with swift butterfly blades. Her Resurgence lets her act again after defeating an enemy. Born in the oppressive Underworld, she channels grief into lethal precision.',
        eidolons: 6, traces: 10,
        light_cone: 'In the Night'
      },
      Bronya: {
        num: '02',
        emoji: '🐻',
        portrait: '',
        thumb:   '',
        title: 'The Icy Heart',
        element: 'Wind', rarity: '5★',
        path: 'The Hunt', faction: 'Belobog',
        stats: [
          { l: 'ATK', v: 60, c: '#c060ff' },
          { l: 'SPD', v: 78, c: '#4ab3e0' },
          { l: 'DEF', v: 72, c: '#60c0a0' },
          { l: 'Res',  v: 80, c: '#e08040' }
        ],
        desc: "Commander of the Silvermane Guards. Bronya supports allies by advancing their actions and buffing ATK. A child soldier shaped by war, she now shoulders Belobog's future with calm resolve.",
        eidolons: 0, traces: 10,
        light_cone: "But the Battle Isn't Over"
      },
      'Dan Heng': {
        num: '03',
        emoji: '🐉',
        portrait: '',
        thumb:   '',
        title: 'Exiled Dragon',
        element: 'Wind', rarity: '4★',
        path: 'The Hunt', faction: 'Astral Express',
        stats: [
          { l: 'ATK', v: 75, c: '#c060ff' },
          { l: 'SPD', v: 88, c: '#4ab3e0' },
          { l: 'DEF', v: 48, c: '#60c0a0' },
          { l: 'Res',  v: 40, c: '#e08040' }
        ],
        desc: 'A quiet archivist aboard the Astral Express. His Wind Reaping talent pierces enemies with SPD reduction. A man fleeing his past as a Luofu General, harboring a dragon god sealed within.',
        eidolons: 4, traces: 8,
        light_cone: 'Cruising in the Stellar Sea'
      },
      Sushang: {
        num: '04',
        emoji: '⚔️',
        portrait: '',
        thumb:   '',
        title: 'Sword Girl',
        element: 'Physical', rarity: '4★',
        path: 'The Hunt', faction: 'Xianzhou Luofu',
        stats: [
          { l: 'ATK', v: 78, c: '#c060ff' },
          { l: 'SPD', v: 82, c: '#4ab3e0' },
          { l: 'DEF', v: 45, c: '#60c0a0' },
          { l: 'Res',  v: 35, c: '#e08040' }
        ],
        desc: "An ambitious sword-maiden of the Xianzhou Luofu. Her Sword Stance applies Sheathed Blade stacks. Full of energy and naivety, she dreams of becoming a legendary Cloud Knight.",
        eidolons: 6, traces: 9,
        light_cone: 'Only Silence Remains'
      }
    }
  },

  ERUDITION: {
    label: 'Erudition',
    members: ['Himeko', 'Jing Yuan', 'Herta', 'Serval'],
    chars: {
      Himeko: {
        num: '01', emoji: '🔥', portrait: '', thumb: '',
        title: 'Starfire Wanderer', element: 'Fire', rarity: '5★',
        path: 'Erudition', faction: 'Astral Express',
        stats: [{ l:'ATK',v:88,c:'#c060ff'},{l:'SPD',v:70,c:'#4ab3e0'},{l:'DEF',v:50,c:'#60c0a0'},{l:'Res',v:45,c:'#e08040'}],
        desc: "Chief engineer of the Astral Express and its flame-wielding genius. Her Molten Detonation stacks charge on enemy weakness breaks. Driven by an obsession with Aeons, she forged the Express herself.",
        eidolons: 4, traces: 10, light_cone: 'Night on the Milky Way'
      },
      'Jing Yuan': {
        num: '02', emoji: '⚡', portrait: '', thumb: '',
        title: 'Arbiter-General', element: 'Lightning', rarity: '5★',
        path: 'Erudition', faction: 'Xianzhou Luofu',
        stats: [{ l:'ATK',v:85,c:'#c060ff'},{l:'SPD',v:66,c:'#4ab3e0'},{l:'DEF',v:58,c:'#60c0a0'},{l:'Res',v:50,c:'#e08040'}],
        desc: "The laughing, languid general of the Luofu. His Lightning-Lord summon gains Hits per Action stacks, unleashing follow-up devastation. Beneath the sleepy grin lies a thousand years of war.",
        eidolons: 0, traces: 10, light_cone: 'Before Dawn'
      },
      Herta: {
        num: '03', emoji: '🪆', portrait: '', thumb: '',
        title: 'The Ice Marionette', element: 'Ice', rarity: '4★',
        path: 'Erudition', faction: 'IPC',
        stats: [{ l:'ATK',v:72,c:'#c060ff'},{l:'SPD',v:80,c:'#4ab3e0'},{l:'DEF',v:40,c:'#60c0a0'},{l:'Res',v:30,c:'#e08040'}],
        desc: "One of the Seven Sages, Herta projects her consciousness into doll bodies. Her follow-up triggers whenever an enemy falls below 50% HP. Brilliant, eccentric, and insufferably casual about it.",
        eidolons: 6, traces: 7, light_cone: "Geniuses' Repose"
      },
      Serval: {
        num: '04', emoji: '🎸', portrait: '', thumb: '',
        title: "Landau's Choice", element: 'Lightning', rarity: '4★',
        path: 'Erudition', faction: 'Belobog',
        stats: [{ l:'ATK',v:70,c:'#c060ff'},{l:'SPD',v:74,c:'#4ab3e0'},{l:'DEF',v:44,c:'#60c0a0'},{l:'Res',v:38,c:'#e08040'}],
        desc: "Belobog's resident rock-and-roll mechanic and daughter of the disgraced Landau family. Her DoTs extend with each enemy attacked. She traded a noble future for guitar strings and grease-stained gloves.",
        eidolons: 6, traces: 8, light_cone: 'The Seriousness of Breakfast'
      }
    }
  },

  HARMONY: {
    label: 'Harmony',
    members: ['Tingyun', 'Pela', 'Asta', 'Yukong'],
    chars: {
      Tingyun: {
        num: '01', emoji: '🦊', portrait: '', thumb: '',
        title: 'Foxian Merchant', element: 'Lightning', rarity: '4★',
        path: 'Harmony', faction: 'Xianzhou Luofu',
        stats: [{ l:'ATK',v:55,c:'#c060ff'},{l:'SPD',v:90,c:'#4ab3e0'},{l:'DEF',v:42,c:'#60c0a0'},{l:'Res',v:70,c:'#e08040'}],
        desc: "A silver-tongued Foxian merchant. Benediction grants ATK% buff and stacks Energy to allies. She navigates politics and commerce with equal ease and a fox's wit.",
        eidolons: 6, traces: 10, light_cone: 'Carve the Moon, Weave the Clouds'
      },
      Pela: {
        num: '02', emoji: '🧊', portrait: '', thumb: '',
        title: 'The Dawn Star', element: 'Ice', rarity: '4★',
        path: 'Nihility', faction: 'Belobog',
        stats: [{ l:'ATK',v:48,c:'#c060ff'},{l:'SPD',v:82,c:'#4ab3e0'},{l:'DEF',v:55,c:'#60c0a0'},{l:'Res',v:65,c:'#e08040'}],
        desc: "Intelligence officer for the Silvermane Guards. Her ultimate strips enemy DEF and applies Exposed. Beneath the cold efficiency is a girl who leaves secret treats for office colleagues.",
        eidolons: 6, traces: 9, light_cone: 'Resolution Shines as Pearls of Sweat'
      },
      Asta: {
        num: '03', emoji: '☀️', portrait: '', thumb: '',
        title: 'Starfire Research', element: 'Fire', rarity: '4★',
        path: 'Harmony', faction: 'IPC',
        stats: [{ l:'ATK',v:52,c:'#c060ff'},{l:'SPD',v:85,c:'#4ab3e0'},{l:'DEF',v:60,c:'#60c0a0'},{l:'Res',v:68,c:'#e08040'}],
        desc: "A spirited IPC researcher. Aether stacks from Charging boost ATK%, and her Ultimate buffs the whole team's SPD. Always behind on paperwork, always ahead on enthusiasm.",
        eidolons: 5, traces: 8, light_cone: 'Meshing Cogs'
      },
      Yukong: {
        num: '04', emoji: '🏹', portrait: '', thumb: '',
        title: 'The Bowmaster', element: 'Imaginary', rarity: '4★',
        path: 'Harmony', faction: 'Xianzhou Luofu',
        stats: [{ l:'ATK',v:58,c:'#c060ff'},{l:'SPD',v:76,c:'#4ab3e0'},{l:'DEF',v:50,c:'#60c0a0'},{l:'Res',v:62,c:'#e08040'}],
        desc: "Head of the Sky-Faring Commission and a master bowwoman. Roaring Bowstrings stacks buff the whole team's ATK. Fiercely protective of the Luofu's traditions.",
        eidolons: 4, traces: 7, light_cone: "But the Battle Isn't Over"
      }
    }
  },

  NIHILITY: {
    label: 'Nihility',
    members: ['Kafka', 'Welt', 'Sampo', 'Guinaifen'],
    chars: {
      Kafka: {
        num: '01', emoji: '🌸', portrait: '', thumb: '',
        title: 'Butterfly of Catastrophe', element: 'Lightning', rarity: '5★',
        path: 'Nihility', faction: 'Stellaron Hunters',
        stats: [{ l:'ATK',v:90,c:'#c060ff'},{l:'SPD',v:80,c:'#4ab3e0'},{l:'DEF',v:42,c:'#60c0a0'},{l:'Res',v:60,c:'#e08040'}],
        desc: "An elite Stellaron Hunter with unnerving calm. Her passive triggers Shock DoT on all allies' attacks. The soft smile conceals a predator who once turned an entire planet to ash.",
        eidolons: 2, traces: 10, light_cone: 'Patience Is All You Need'
      },
      Welt: {
        num: '02', emoji: '🌀', portrait: '', thumb: '',
        title: 'Sovereign of Old', element: 'Imaginary', rarity: '5★',
        path: 'Nihility', faction: 'Astral Express',
        stats: [{ l:'ATK',v:76,c:'#c060ff'},{l:'SPD',v:72,c:'#4ab3e0'},{l:'DEF',v:58,c:'#60c0a0'},{l:'Res',v:55,c:'#e08040'}],
        desc: "Former sovereign of a crumbling world, now aboard the Astral Express. His Imaginary Arts imprison enemies, applying Entanglement. He carries an entire planet's people inside a tiny device.",
        eidolons: 0, traces: 10, light_cone: 'In the Name of the World'
      },
      Sampo: {
        num: '03', emoji: '🗡️', portrait: '', thumb: '',
        title: 'The Wily Rogue', element: 'Wind', rarity: '4★',
        path: 'Nihility', faction: 'Jarilo-VI',
        stats: [{ l:'ATK',v:68,c:'#c060ff'},{l:'SPD',v:78,c:'#4ab3e0'},{l:'DEF',v:38,c:'#60c0a0'},{l:'Res',v:48,c:'#e08040'}],
        desc: "A smuggler and information broker on Jarilo-VI. His Wind Shear DoT stacks up to 5 times and spreads. He'll do anything for a profit — and has somehow made friends along the way.",
        eidolons: 6, traces: 8, light_cone: 'Eyes of the Prey'
      },
      Guinaifen: {
        num: '04', emoji: '🔮', portrait: '', thumb: '',
        title: 'Fiery Puppet Master', element: 'Fire', rarity: '4★',
        path: 'Nihility', faction: 'Xianzhou Luofu',
        stats: [{ l:'ATK',v:65,c:'#c060ff'},{l:'SPD',v:74,c:'#4ab3e0'},{l:'DEF',v:44,c:'#60c0a0'},{l:'Res',v:52,c:'#e08040'}],
        desc: "Street performer and flame puppeteer of the Luofu. Firekiss stacks on Burn enemies spread to adjacent targets. Behind the flashy shows is a mind always three acts ahead.",
        eidolons: 6, traces: 7, light_cone: 'Fermata'
      }
    }
  },

  DESTRUCTION: {
    label: 'Destruction',
    members: ['Blade', 'Clara', 'Arlan', 'Trailblazer'],
    chars: {
      Blade: {
        num: '01', emoji: '🩸', portrait: '', thumb: '',
        title: 'Emanator of Destruction', element: 'Wind', rarity: '5★',
        path: 'Destruction', faction: 'Stellaron Hunters',
        stats: [{ l:'ATK',v:72,c:'#c060ff'},{l:'SPD',v:68,c:'#4ab3e0'},{l:'DEF',v:35,c:'#60c0a0'},{l:'Res',v:42,c:'#e08040'}],
        desc: "An immortal swordsman seeking death. He converts HP loss into ATK buffs and gains a follow-up from accumulated damage. Thousands of years of failed suicide attempts have made him the most dangerous being alive.",
        eidolons: 2, traces: 10, light_cone: 'The Unreachable Side'
      },
      Clara: {
        num: '02', emoji: '🤖', portrait: '', thumb: '',
        title: 'Little Fool', element: 'Physical', rarity: '5★',
        path: 'Destruction', faction: 'Jarilo-VI',
        stats: [{ l:'ATK',v:80,c:'#c060ff'},{l:'SPD',v:60,c:'#4ab3e0'},{l:'DEF',v:55,c:'#60c0a0'},{l:'Res',v:35,c:'#e08040'}],
        desc: "An orphan girl of the Underworld, paired with the ancient automaton Svarog. Svarog counters any attack that targets Clara. She sees no monsters — only misunderstood machines and hungry people.",
        eidolons: 4, traces: 9, light_cone: 'Something Irreplaceable'
      },
      Arlan: {
        num: '03', emoji: '⚡', portrait: '', thumb: '',
        title: 'Security Section Head', element: 'Lightning', rarity: '4★',
        path: 'Destruction', faction: 'Herta Space Station',
        stats: [{ l:'ATK',v:82,c:'#c060ff'},{l:'SPD',v:70,c:'#4ab3e0'},{l:'DEF',v:30,c:'#60c0a0'},{l:'Res',v:28,c:'#e08040'}],
        desc: "Chief of security aboard Herta Space Station. His skills cost HP instead of Skill Points, turning wounds into power. Quiet and self-reliant, he never asks for help and rarely needs it.",
        eidolons: 6, traces: 7, light_cone: 'A Secret Vow'
      },
      Trailblazer: {
        num: '04', emoji: '🌟', portrait: '', thumb: '',
        title: 'Child of Destiny', element: 'Fire', rarity: '5★',
        path: 'Destruction', faction: 'Astral Express',
        stats: [{ l:'ATK',v:75,c:'#c060ff'},{l:'SPD',v:72,c:'#4ab3e0'},{l:'DEF',v:65,c:'#60c0a0'},{l:'Res',v:50,c:'#e08040'}],
        desc: "The player character — a young Trailblazer who fell asleep aboard a hijacked Express. Blazing stance builds stacks for massive single-target damage. Every world visited changes them.",
        eidolons: 6, traces: 10, light_cone: 'On the Fall of an Aeon'
      }
    }
  }
};

const elemColor = {
  Quantum: '#b080ff',
  Wind:    '#00d4a0',
  Fire:    '#ff7040',
  Lightning:'#a0a0ff',
  Ice:     '#60d0ff',
  Physical:'#c0c0c0',
  Imaginary:'#f0c040'
};

const gradMap = {
  Quantum:  '135deg, #2a0a5a, #0a1628',
  Wind:     '135deg, #0a3a2a, #0a1628',
  Fire:     '135deg, #5a1a0a, #0a1628',
  Lightning:'135deg, #1a1a5a, #0a1628',
  Ice:      '135deg, #0a2a4a, #0a1628',
  Physical: '135deg, #2a2a2a, #0a1628',
  Imaginary:'135deg, #3a2a0a, #0a1628'
};


let currentRegion  = 'HUNT';
let currentCountry = 'Seele';


function switchRegion(region, btn) {
  currentRegion  = region;
  currentCountry = paths[region].members[0];

  document.querySelectorAll('.hsr-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('sidebarLabel').textContent = paths[region].label;

  renderCountries();
  renderEvents();
}


function switchCountry(name, el) {
  currentCountry = name;
  document.querySelectorAll('.hsr-country').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  renderEvents();
}

function renderCountries() {
  const data = paths[currentRegion];
  const list = document.getElementById('countryList');

  list.innerHTML = data.members.map(name => {
    const char   = data.chars[name];
    const active = name === currentCountry ? ' active' : '';

    let dotStyle = '';
    let dotInner = `<span style="font-size:10px;">${char.emoji}</span>`;

    if (char.thumb) {
      dotStyle = `background-image: url('${char.thumb}'); background-size: cover; background-position: center top;`;
      dotInner = ''; // image replaces emoji
    }

    return `
      <div class="hsr-country${active}" onclick="switchCountry('${name.replace(/'/g, "\\'")}', this)">
        <div class="hsr-country-dot" style="${dotStyle}">${dotInner}</div>
        <span>${name}</span>
      </div>`;
  }).join('');
}

function renderEvents() {
  const char = paths[currentRegion].chars[currentCountry];
  if (!char) return;

  const ec   = elemColor[char.element] || '#4ab3e0';
  const grad = gradMap[char.element]   || '135deg, #1a2a4a, #0a1628';
  const prog = Math.round((char.eidolons / 6 * 0.5 + char.traces / 10 * 0.5) * 100);

  const portraitBg    = char.portrait ? `background-image: url('${char.portrait}');` : '';
  const avatarHidden  = char.portrait ? ' has-image' : '';

  const statsHTML = char.stats.map(s => `
    <div class="stat-item">
      <span class="stat-label">${s.l}</span>
      <div class="stat-bar-wrap">
        <div class="stat-bar">
          <div class="stat-bar-fill" style="width:${s.v}%; background:${s.c};"></div>
        </div>
        <span class="stat-val">${s.v}</span>
      </div>
    </div>`).join('');

  const eidolonPips = [1,2,3,4,5,6].map(i => {
    const cls = i <= char.eidolons ? 'unlocked' : 'locked';
    return `<div class="eidolon-pip ${cls}">${i}</div>`;
  }).join('');

  const tracePips = Array.from({ length: 10 }, (_, i) => {
    const cls = i < char.traces ? 'unlocked' : 'locked';
    return `<div class="trace-pip ${cls}"></div>`;
  }).join('');

  document.getElementById('eventList').innerHTML = `

    <!-- ── Bio card ── -->
    <div class="hsr-event-card">
      <div class="hsr-event-num">
        <span>NO.</span>${char.num}
      </div>

      <div class="hsr-event-img"
           style="background: linear-gradient(${grad}); ${portraitBg}">
        <div class="char-avatar${avatarHidden}">${char.emoji}</div>
        <div class="char-rarity">${char.rarity}</div>
      </div>

      <div class="hsr-event-info">
        <div class="char-name-row">
          <p class="char-name">${currentCountry}</p>
          <span class="char-title">${char.title}</span>
        </div>

        <div class="char-tags">
          <span class="char-tag tag-path">${char.path}</span>
          <span class="char-tag"
                style="color:${ec}; border:1px solid ${ec}44; background:${ec}18;">
            ${char.element}
          </span>
          <span class="char-tag"
                style="background:rgba(180,120,0,0.25); color:#f0c040; border:1px solid rgba(200,150,0,0.4);">
            ${char.rarity}
          </span>
        </div>

        <div class="char-stats">${statsHTML}</div>
        <p class="char-desc">${char.desc}</p>
      </div>

      <button class="hsr-event-btn">View Bio</button>
    </div>

    <!-- ── Development card ── -->
    <div class="hsr-event-card">
      <div class="hsr-event-num" style="font-size:11px; letter-spacing:0.5px;">
        <span>DEV</span>
      </div>

      <div class="dev-card-body">
        <div class="dev-card-row">

          <div>
            <p class="dev-section-label">Eidolons</p>
            <div class="eidolon-pips">${eidolonPips}</div>
          </div>

          <div>
            <p class="dev-section-label">Traces</p>
            <div class="trace-pips">
              ${tracePips}
              <span class="trace-count">${char.traces}/10</span>
            </div>
          </div>

          <div>
            <p class="dev-section-label">Light Cone</p>
            <p class="dev-value">${char.light_cone}</p>
          </div>

          <div>
            <p class="dev-section-label">Faction</p>
            <p class="dev-value">${char.faction}</p>
          </div>

        </div>

        <div class="prog-bar-wrap">
          <p class="dev-section-label">Overall Progression</p>
          <div class="prog-bar-track">
            <div class="prog-bar-fill" style="width:${prog}%;"></div>
          </div>
          <div class="prog-labels">
            <span class="prog-label">0%</span>
            <span class="prog-label center">${prog}% Complete</span>
            <span class="prog-label">100%</span>
          </div>
        </div>
      </div>

      <button class="hsr-event-btn">Build Guide</button>
    </div>`;
}

renderCountries();
renderEvents();