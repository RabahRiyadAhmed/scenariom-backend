import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { Client } from 'pg';

type Palette = {
  background: string; surface: string; card: string; border: string;
  primary: string; secondary: string; accent: string; info: string;
  foreground: string; muted: string; disabled: string; metallic: string;
  gold: string; success: string; warning: string; danger: string;
  pink: string; purple: string; orange: string; teal: string;
};

const lightBase: Palette = {
  background: '#F8FAFC', surface: '#FFFFFF', card: '#F1F5F9', border: '#D8DEE9',
  primary: '#1E3A8A', secondary: '#475569', accent: '#6D28D9', info: '#0369A1',
  foreground: '#111827', muted: '#64748B', disabled: '#9CA3AF', metallic: '#9CA3AF',
  gold: '#B58A16', success: '#15803D', warning: '#B45309', danger: '#B91C1C',
  pink: '#DB2777', purple: '#7E22CE', orange: '#C2410C', teal: '#0F766E',
};

const darkBase: Palette = {
  background: '#0B1020', surface: '#151C31', card: '#202A43', border: '#35415E',
  primary: '#4967E8', secondary: '#94A3B8', accent: '#8B5CF6', info: '#38BDF8',
  foreground: '#F8FAFC', muted: '#A7B1C7', disabled: '#667085', metallic: '#9CA3AF',
  gold: '#D4AF37', success: '#4ADE80', warning: '#FBBF24', danger: '#F87171',
  pink: '#F472B6', purple: '#C084FC', orange: '#FB923C', teal: '#2DD4BF',
};

type ThemeOptions = {
  effect?: 'none' | 'glow' | 'laser' | 'pulse';
  shape?: 'rounded' | 'pill' | 'sharp';
  borderWidth?: number;
  radius?: { sm: number; md: number; lg: number; xl: number };
  motion?: { fast: number; normal: number; slow: number };
};

const sharpShape = {
  type: 'svg-path' as const,
  viewBox: '0 0 240 72',
  path: 'M10 8 L218 8 L232 22 L224 64 L22 64 L8 50 Z',
};

function makeTheme(slug: string, name: string, light: Partial<Palette>, dark: Partial<Palette>, options: ThemeOptions = {}) {
  const effect = options.effect ?? 'none';
  const shape = options.shape === 'sharp' ? sharpShape : { type: options.shape ?? 'rounded' };
  const borderWidth = options.borderWidth ?? (effect === 'laser' ? 2 : 1);
  return {
    schemaVersion: 1,
    slug,
    name,
    modes: { light: { ...lightBase, ...light }, dark: { ...darkBase, ...dark } },
    radius: options.radius ?? { sm: 6, md: 10, lg: 16, xl: 24 },
    motion: options.motion ?? { fast: 150, normal: 240, slow: 500 },
    components: {
      button: { shape, effect, borderWidth },
      card: { effect, borderWidth },
    },
  };
}

const themes = [
  { slug: 'retro', name: 'Retro', description: 'Warm paper, faded ink and tactile vintage controls.', definition: makeTheme('retro', 'Retro',
    { background:'#F4E7C5',surface:'#FFF8E7',card:'#E9D3A1',border:'#765C3D',primary:'#8F3329',secondary:'#6F563A',accent:'#B8661F',info:'#315B63',foreground:'#2B2118',muted:'#755E49',metallic:'#8A7762',gold:'#9D6B18',success:'#4F772D',warning:'#9D5911',danger:'#922929',pink:'#A94F64',purple:'#76558C',orange:'#A94D19',teal:'#376F69' },
    { background:'#211A17',surface:'#30251F',card:'#443329',border:'#8A6A4A',primary:'#E07A5F',secondary:'#B08968',accent:'#F2CC8F',info:'#81B29A',foreground:'#FFF4DB',muted:'#C4AA8D' },
    { radius:{sm:3,md:6,lg:10,xl:14}, motion:{fast:140,normal:220,slow:380} }), extraData: { category: 'period', backgroundImagePath: '/assets/themes/Retro/background.jpg', slideImagePath:'/assets/themes/Retro/slide.jpg', backgroundOpacity: { light: 75, dark: 55 } } },

  { slug: 'cyberpunk', name: 'Cyberpunk', description: 'Electric cyan, toxic magenta and angular laser interfaces.', definition: makeTheme('cyberpunk', 'Cyberpunk',
    { background:'#F5F7FF',surface:'#FFFFFF',card:'#E8EBFF',border:'#6558D3',primary:'#6420D6',secondary:'#3949AB',accent:'#C90094',info:'#00778A',foreground:'#151027',muted:'#625B78' },
    { background:'#070512',surface:'#100B22',card:'#18102E',border:'#00E5FF',primary:'#FF2BD6',secondary:'#7B61FF',accent:'#00F6FF',info:'#00E5FF',foreground:'#F9F7FF',muted:'#A79BBC',danger:'#FF4268',warning:'#FFE14A' },
    { effect:'laser',shape:'sharp',radius:{sm:0,md:2,lg:4,xl:6},motion:{fast:80,normal:150,slow:280} }), extraData: { category: 'futuristic', backgroundImagePath: '/assets/themes/cyberpunk/background.jpg', backgroundImageDarkPath:'/assets/themes/cyberpunk/background-dark.jpg', slideImagePath:'/assets/themes/cyberpunk/slide.jpg', backgroundOpacity: { light: 70, dark: 40 } } },

  { slug: 'neon', name: 'Neon', description: 'Luminous club colors, soft capsules and strong glow.', definition: makeTheme('neon', 'Neon',
    { background:'#F7FFF9',surface:'#FFFFFF',card:'#E9FFF1',border:'#008F5C',primary:'#7017CF',secondary:'#006D62',accent:'#008F5C',info:'#0079A8',foreground:'#102018',muted:'#527064' },
    { background:'#04080A',surface:'#071116',card:'#0A1920',border:'#36FF8B',primary:'#B53CFF',secondary:'#00D9C0',accent:'#36FF8B',info:'#23D5FF',foreground:'#F4FFF8',muted:'#8FB7A0' },
    { effect:'glow',shape:'pill',radius:{sm:10,md:16,lg:24,xl:32},motion:{fast:120,normal:200,slow:420} }), extraData: { category: 'futuristic', backgroundImagePath: '/assets/themes/Neon/background.jpg', backgroundImageDarkPath:'/assets/themes/Neon/background-dark.jpg', slideImagePath:'/assets/themes/Neon/slide.jpg', backgroundOpacity: { light: 70, dark: 45 } } },

  { slug: 'arcane', name: 'Arcane', description: 'Occult study, astral charts, muted amethyst and antique gold.', definition: makeTheme('arcane', 'Arcane',
    { background:'#F3F0EA',surface:'#FBF9F5',card:'#EAE4E5',border:'#88758F',primary:'#624778',secondary:'#514457',accent:'#806126',info:'#426E7A',foreground:'#251F2B',muted:'#574B5A',metallic:'#716878',gold:'#92742F',success:'#496B51',warning:'#87611E',danger:'#843E45',pink:'#8F5B70',purple:'#614676',orange:'#8B5932',teal:'#456B67' },
    { background:'#0D0A12',surface:'#17111D',card:'#211827',border:'#62536E',primary:'#9B7DB8',secondary:'#94869B',accent:'#C2A056',info:'#70A0AD',foreground:'#F3EAF5',muted:'#AEA1B2',metallic:'#A49BA8',gold:'#C2A056',success:'#73977B',warning:'#C9A258',danger:'#BF6870',pink:'#C18AA1',purple:'#A187BD',orange:'#C78A60',teal:'#78A39D' },
    { radius:{sm:4,md:8,lg:12,xl:18},motion:{fast:160,normal:280,slow:560} }), extraData: { category: 'mystical', backgroundImagePath: '/assets/themes/arcane/background.jpg', slideImagePath:'/assets/themes/arcane/slide.jpg', backgroundOpacity: { light: 80, dark: 55 } } },

  { slug: 'fantasy', name: 'Fantasy', description: 'Medieval magic, heroic adventure, enchanted blue and heraldic gold.', definition: makeTheme('fantasy', 'Fantasy',
    { background:'#F3EBD8',surface:'#FFF9EA',card:'#E8DDC2',border:'#8B7448',primary:'#31598B',secondary:'#675D4E',accent:'#8D6B19',info:'#397783',foreground:'#292117',muted:'#746957',metallic:'#858078',gold:'#A47A18',success:'#47733E',warning:'#936518',danger:'#913A38',pink:'#9C526B',purple:'#674D8B',orange:'#A35C2A',teal:'#39766C' },
    { background:'#0B111C',surface:'#131D2B',card:'#1C293A',border:'#6E6247',primary:'#70A7E8',secondary:'#A99E88',accent:'#E2B956',info:'#6EC1CE',foreground:'#FFF4D8',muted:'#B8AD97',metallic:'#A39D91',gold:'#E2B956',success:'#79B16B',warning:'#E0AE46',danger:'#D56A62',purple:'#A78BCE' },
    { borderWidth:2,radius:{sm:5,md:9,lg:14,xl:20},motion:{fast:150,normal:250,slow:480} }), extraData: { category: 'medieval-fantasy', backgroundImagePath:'/assets/themes/Fantasy/background.jpg', slideImagePath:'/assets/themes/Fantasy/slide.jpg', backgroundOpacity:{light:72,dark:48} } },

  { slug: 'manga', name: 'Manga', description: 'Ink-black structure, white paper and aggressive red accents.', definition: makeTheme('manga', 'Manga',
    { background:'#FFFFFF',surface:'#F5F5F5',card:'#FFFFFF',border:'#000000',primary:'#D91F1B',secondary:'#555555',accent:'#D91F1B',info:'#2058B5',foreground:'#08080A',muted:'#686868',disabled:'#AAAAAA',metallic:'#BDBDBD',gold:'#A97800',success:'#14833A',warning:'#A96200',danger:'#C91515' },
    { background:'#09090B',surface:'#111114',card:'#18181C',border:'#FFFFFF',primary:'#FF3732',secondary:'#E5E5E5',accent:'#FFD60A',info:'#5791FF',foreground:'#FFFFFF',muted:'#A3A3A3' },
    { shape:'sharp',borderWidth:2,radius:{sm:0,md:2,lg:4,xl:6},motion:{fast:70,normal:130,slow:220} }), extraData: { category: 'graphic', backgroundImagePath:'/assets/themes/manga/background.jpg', slideImagePath:'/assets/themes/manga/slide.jpg', backgroundOpacity:{light:72,dark:45} } },

  { slug: 'editorial', name: 'Editorial', description: 'Quiet paper, restrained ink and typography-first reading.', definition: makeTheme('editorial', 'Editorial',
    { background:'#F7F5F0',surface:'#FCFBF8',card:'#FFFFFF',border:'#D8D4CC',primary:'#222222',secondary:'#66635E',accent:'#7D382D',info:'#35628C',foreground:'#191919',muted:'#716D66',disabled:'#B5B1A8',metallic:'#A7A299',gold:'#9A794A',success:'#477454',warning:'#866B12',danger:'#913838',pink:'#A95367',purple:'#6E608B',orange:'#9E6230',teal:'#417C7C' },
    { background:'#1B1916',surface:'#25231F',card:'#2E2B26',border:'#5B554C',primary:'#9B4E3A',secondary:'#C1B8AA',accent:'#D48768',info:'#7BA8C9',foreground:'#F0EDE6',muted:'#BDB4A7' },
    { radius:{sm:2,md:4,lg:6,xl:8},motion:{fast:110,normal:170,slow:280} }), extraData: { category: 'minimal', backgroundImagePath: '/assets/themes/Editorial/background.jpg', slideImagePath:'/assets/themes/Editorial/slide.jpg', backgroundOpacity: { light: 85, dark: 60 } } },

  { slug: 'noir', name: 'Noir', description: 'Cinematic shadows, cold metal, antique gold and restrained crimson.', definition: makeTheme('noir', 'Noir',
    { background:'#E8E6E1',surface:'#F2F0EC',card:'#FFFFFF',border:'#343840',primary:'#1A1D22',secondary:'#60656F',accent:'#98172B',info:'#35628C',foreground:'#08090B',muted:'#62666E',metallic:'#747880',gold:'#987B32',success:'#397246',warning:'#866015',danger:'#98172B' },
    { background:'#07080A',surface:'#101217',card:'#171A20',border:'#343840',primary:'#D0B463',secondary:'#7A7F8A',accent:'#BD203A',info:'#6BA5DC',foreground:'#F5F5F3',muted:'#989BA3',metallic:'#6A6E76',gold:'#D0B463' },
    { radius:{sm:2,md:5,lg:8,xl:12},motion:{fast:150,normal:260,slow:480} }), extraData: { category: 'cinematic', backgroundImagePath: '/assets/themes/Noir/background.jpg', slideImagePath:'/assets/themes/Noir/slide.jpg', backgroundOpacity: { light: 75, dark: 50 } } },

  { slug: 'royal', name: 'Royal', description: 'Burgundy velvet, ivory paper and ceremonial gold.', definition: makeTheme('royal', 'Royal',
    { background:'#F7F0E5',surface:'#FFF9EF',card:'#F1E5D2',border:'#9C7A48',primary:'#711D36',secondary:'#69544D',accent:'#8B651E',info:'#365F7A',foreground:'#2D1720',muted:'#745F61',gold:'#9B711B',success:'#496B46',warning:'#906417',danger:'#8D2637',pink:'#A74365',purple:'#694786',orange:'#A0522D',teal:'#3F7470' },
    { background:'#180B11',surface:'#251019',card:'#341725',border:'#8E6A3C',primary:'#C85C7D',secondary:'#BCA8A4',accent:'#D6AD58',info:'#78A8C2',foreground:'#FFF4E6',muted:'#C4ADB1',gold:'#D6AD58' },
    { shape:'pill',radius:{sm:8,md:14,lg:20,xl:28},motion:{fast:160,normal:260,slow:460} }), extraData: { category:'historical', backgroundImagePath:'/assets/themes/royal/background.jpg', backgroundImageDarkPath:'/assets/themes/royal/background-dark.png', slideImagePath:'/assets/themes/royal/slide.jpg', backgroundOpacity:{light:76,dark:50} } },

  { slug: 'forest', name: 'Forest', description: 'Forest greens, warm cream and grounded natural surfaces.', definition: makeTheme('forest', 'Forest',
    { background:'#EEF1E6',surface:'#F8F6ED',card:'#E1E7D6',border:'#687659',primary:'#315B3A',secondary:'#4A432F',accent:'#8A681E',info:'#315F5F',foreground:'#17231A',muted:'#46523F',metallic:'#707667',gold:'#94721F',success:'#35623C',warning:'#795714',danger:'#79362F',pink:'#88465A',purple:'#59426F',orange:'#884A26',teal:'#2D665D' },
    { background:'#0E1711',surface:'#172219',card:'#213024',border:'#53644F',primary:'#79B986',secondary:'#A99C7A',accent:'#C6A04D',info:'#76ACA7',foreground:'#EEF5EA',muted:'#A7B39F',success:'#75B27B' },
    { radius:{sm:8,md:12,lg:18,xl:26},motion:{fast:170,normal:280,slow:520} }), extraData: { category:'nature', backgroundImagePath:'/assets/themes/forest/background.jpg', backgroundImageDarkPath:'/assets/themes/forest/background-dark.jpg', slideImagePath:'/assets/themes/forest/slide.jpg', backgroundOpacity:{light:76,dark:48} } },

  { slug: 'nature', name: 'Nature', description: 'Open landscapes, fresh leaves, sunlight and calm organic surfaces.', definition: makeTheme('nature', 'Nature',
    { background:'#F4F3DE',surface:'#FCFAED',card:'#E7EBCF',border:'#9DA879',primary:'#4D7B45',secondary:'#777253',accent:'#A8792A',info:'#4B8583',foreground:'#253123',muted:'#6F765E',metallic:'#939785',gold:'#A27A2C',success:'#4D7B45',warning:'#9C731F',danger:'#A14C43',pink:'#A96372',purple:'#77608E',orange:'#B06A32',teal:'#43877B' },
    { background:'#152017',surface:'#1E2B20',card:'#29382A',border:'#60745B',primary:'#8EC580',secondary:'#B0A984',accent:'#D3AD57',info:'#78BBB3',foreground:'#F3F1D9',muted:'#B1B99E',success:'#8EC580',teal:'#78BBB3' },
    { radius:{sm:12,md:18,lg:26,xl:36},motion:{fast:190,normal:330,slow:680} }), extraData: { category:'calm-nature', backgroundImagePath:'/assets/themes/nature/background.jpg', slideImagePath:'/assets/themes/nature/slide.jpg', backgroundOpacity:{light:80,dark:55} } },

  { slug: 'horror', name: 'Horror', description: 'Dirty ash, dried blood and unsettling irregular geometry.', definition: makeTheme('horror', 'Horror',
    { background:'#DDD9D2',surface:'#E9E5DE',card:'#D2CEC7',border:'#4E4947',primary:'#651C1C',secondary:'#5F5954',accent:'#8A2520',info:'#405F63',foreground:'#1A1716',muted:'#655F5B',metallic:'#77716E',gold:'#806B33',success:'#486044',warning:'#80601C',danger:'#7C1717' },
    { background:'#090707',surface:'#120E0E',card:'#1C1515',border:'#493939',primary:'#B83232',secondary:'#8D8181',accent:'#8A1111',info:'#66868A',foreground:'#F1E9E5',muted:'#A59591',danger:'#E04B4B' },
    { effect:'pulse',shape:'sharp',borderWidth:2,radius:{sm:0,md:1,lg:3,xl:5},motion:{fast:190,normal:360,slow:760} }), extraData: { category:'horror', backgroundImagePath:'/assets/themes/horror/background.jpg', slideImagePath:'/assets/themes/horror/slide.jpg', backgroundOpacity:{light:72,dark:42} } },

  { slug: 'blood', name: 'Blood', description: 'Graphic black, arterial red and brutal high-contrast surfaces.', definition: makeTheme('blood', 'Blood',
    { background:'#E7E1DF',surface:'#F4EFED',card:'#D8CFCD',border:'#491B1D',primary:'#8E1019',secondary:'#403234',accent:'#B00E1B',info:'#354F59',foreground:'#190B0D',muted:'#4C3D40',metallic:'#625557',gold:'#856A2A',success:'#31583B',warning:'#794A10',danger:'#A80013',pink:'#8E2140',purple:'#522B56',orange:'#882E17',teal:'#2E5856' },
    { background:'#050304',surface:'#0C0708',card:'#160A0C',border:'#69111B',primary:'#E21B2D',secondary:'#8B7376',accent:'#FF3045',info:'#66838C',foreground:'#FFF1F2',muted:'#B29296',danger:'#FF3045' },
    { effect:'laser',shape:'sharp',borderWidth:2,radius:{sm:0,md:0,lg:2,xl:3},motion:{fast:70,normal:120,slow:240} }), extraData: { category:'graphic-horror', backgroundImagePath:'/assets/themes/blood/background.jpg', backgroundImageDarkPath:'/assets/themes/blood/background-dark.jpg', slideImagePath:'/assets/themes/blood/slide.jpg', backgroundOpacity:{light:78,dark:44} } },

  { slug: 'ocean', name: 'Ocean', description: 'Sunlit turquoise water, pale sand and a fresh coastal atmosphere.', definition: makeTheme('ocean', 'Ocean',
    { background:'#E9FAF8',surface:'#FBFFFD',card:'#D8F4EF',border:'#63B9B5',primary:'#087F91',secondary:'#527E83',accent:'#16A6A1',info:'#169BC5',foreground:'#12363A',muted:'#5B7D7D',metallic:'#82A7A5',gold:'#B39032',success:'#2B8A6E',warning:'#A7791F',danger:'#B34A54',teal:'#16A6A1' },
    { background:'#092832',surface:'#103944',card:'#174B55',border:'#3B9294',primary:'#5AD9E5',secondary:'#91C4C2',accent:'#58E3C2',info:'#69D7FA',foreground:'#F0FFFC',muted:'#A5D2CE',teal:'#58E3C2' },
    { shape:'pill',radius:{sm:12,md:18,lg:26,xl:36},motion:{fast:180,normal:330,slow:700} }), extraData: { category:'coastal', backgroundImagePath:'/assets/themes/Ocene/background.jpg', backgroundImageDarkPath:'/assets/themes/Ocene/background-dark.jpg', slideImagePath:'/assets/themes/Ocene/slide.jpg', backgroundOpacity:{light:78,dark:56} } },

  { slug: 'abyss', name: 'Abyss', description: 'Crushing depth, near-black blue and cold bioluminescent cyan.', definition: makeTheme('abyss', 'Abyss',
    { background:'#101B24',surface:'#172732',card:'#203540',border:'#355563',primary:'#397F99',secondary:'#718A94',accent:'#35A7AD',info:'#3F93B2',foreground:'#E5F3F5',muted:'#9CB0B6',disabled:'#64777D',metallic:'#71858B',gold:'#A18A4B',success:'#4C8B73',warning:'#B28A42',danger:'#B75A68',teal:'#35A7AD' },
    { background:'#010407',surface:'#030A10',card:'#06121B',border:'#102E3D',primary:'#0E5B78',secondary:'#466773',accent:'#008B96',info:'#167FA5',foreground:'#D8EEF2',muted:'#6F929C',disabled:'#344E57',metallic:'#536B72',gold:'#80713D',success:'#276B57',warning:'#9A752C',danger:'#9D3A4D',teal:'#008B96' },
    { effect:'glow',radius:{sm:3,md:7,lg:12,xl:18},motion:{fast:220,normal:440,slow:900} }), extraData: { category:'deep-ocean', backgroundImagePath:'/assets/themes/abyss/background.jpg', slideImagePath:'/assets/themes/abyss/slide.jpg', backgroundOpacity:{light:54,dark:32} } },

  { slug: 'steampunk', name: 'Steampunk', description: 'Charcoal machinery, aged brass, copper and industrial controls.', definition: makeTheme('steampunk', 'Steampunk',
    { background:'#E8DDC8',surface:'#F3E8D2',card:'#D6C5A8',border:'#765B3A',primary:'#784421',secondary:'#66594A',accent:'#9A642B',info:'#3F6870',foreground:'#2A2118',muted:'#716251',metallic:'#7C746A',gold:'#946B22',success:'#4F6D45',warning:'#8F5E17',danger:'#8A342B',orange:'#9A5129' },
    { background:'#17130F',surface:'#241D16',card:'#33281E',border:'#765B3A',primary:'#D1874E',secondary:'#A99A86',accent:'#D6A34F',info:'#77A0A5',foreground:'#F5E7D0',muted:'#B9A68D',metallic:'#A79D91',gold:'#D6A34F',orange:'#D1874E' },
    { borderWidth:2,radius:{sm:3,md:6,lg:10,xl:14},motion:{fast:130,normal:230,slow:430} }), extraData: { category:'industrial-period', backgroundImagePath:'/assets/themes/steampunk/background.jpg', slideImagePath:'/assets/themes/steampunk/slide.jpg', backgroundOpacity:{light:72,dark:46} } },

  { slug: 'pastel-dream', name: 'Pastel Dream', description: 'Lavender, blush and sky tones for romance and gentle stories.', definition: makeTheme('pastel-dream', 'Pastel Dream',
    { background:'#FBF5FC',surface:'#FFF9FD',card:'#F3E8F7',border:'#C7AFD3',primary:'#815B9A',secondary:'#8A7085',accent:'#B05F88',info:'#4F849D',foreground:'#35293A',muted:'#77677C',metallic:'#A69CAA',gold:'#9B792D',success:'#568364',warning:'#9A7025',danger:'#A84E65',pink:'#B05F88',purple:'#815B9A',orange:'#B86F46',teal:'#4F8C89' },
    { background:'#1C1522',surface:'#281D30',card:'#35263F',border:'#765F82',primary:'#C9A0DF',secondary:'#B7A1B3',accent:'#F09AC2',info:'#8DC7DF',foreground:'#FFF5FC',muted:'#C7B5CA',pink:'#F09AC2',purple:'#C9A0DF' },
    { shape:'pill',radius:{sm:12,md:18,lg:26,xl:36},motion:{fast:180,normal:320,slow:620} }), extraData: { category:'romance', backgroundImagePath:'/assets/themes/dream/background.jpg', backgroundImageDarkPath:'/assets/themes/dream/background-dark.jpg', slideImagePath:'/assets/themes/dream/slide.jpg', backgroundOpacity:{light:80,dark:56} } },

  { slug: 'terminal', name: 'Terminal', description: 'Monochrome phosphor interface inspired by command-line systems.', definition: makeTheme('terminal', 'Terminal',
    { background:'#EAF3EA',surface:'#F4FAF4',card:'#DDEADD',border:'#35693E',primary:'#145D27',secondary:'#304F37',accent:'#087334',info:'#1F5B53',foreground:'#081E0D',muted:'#354F3A',metallic:'#596D5D',gold:'#756118',success:'#145D27',warning:'#6C570D',danger:'#7D2727',teal:'#1F5B53' },
    { background:'#020603',surface:'#050C07',card:'#09150C',border:'#1D6B31',primary:'#35E060',secondary:'#73A47C',accent:'#69FF8D',info:'#45D6B4',foreground:'#C8FFD3',muted:'#79A982',disabled:'#3C6043',metallic:'#598460',gold:'#B8A84C',success:'#35E060',warning:'#D3C54C',danger:'#FF6B6B',teal:'#45D6B4' },
    { shape:'sharp',radius:{sm:0,md:0,lg:2,xl:2},motion:{fast:60,normal:100,slow:160} }), extraData: { category:'technical', backgroundImagePath:'/assets/themes/terminal/background.jpg', slideImagePath:'/assets/themes/terminal/slide.jpg', backgroundOpacity:{light:74,dark:38} } },
  { slug:'galactic', name:'Galactic', description:'Deep space, nebulae and luminous stellar interfaces.', definition:makeTheme('galactic','Galactic',
    {background:'#EEF2FF',surface:'#FAFBFF',card:'#E1E7FA',border:'#6577A9',primary:'#3F4E9C',secondary:'#434E72',accent:'#7453C6',foreground:'#10162D',muted:'#4D5877'},
    {background:'#050713',surface:'#0B1022',card:'#121A33',border:'#394D86',primary:'#718BFF',secondary:'#A4B2D9',accent:'#B56CFF',foreground:'#F5F7FF',muted:'#AAB5D5'},{effect:'glow'}),extraData:{category:'sci-fi',backgroundImagePath:'/assets/themes/Galaxie/background.jpg',slideImagePath:'/assets/themes/Galaxie/slide.jpg',backgroundOpacity:{light:72,dark:48}}},
  { slug:'crystal', name:'Crystal', description:'Ice glass, prisms and crystalline cave light.', definition:makeTheme('crystal','Crystal',
    {background:'#ECFAFC',surface:'#FAFFFF',card:'#DCF5F8',border:'#64AEBB',primary:'#257F9A',secondary:'#3D6476',accent:'#806BC4',foreground:'#102D38',muted:'#486B78'},
    {background:'#07151D',surface:'#0C222D',card:'#12313E',border:'#4C9CB1',primary:'#62D3EE',secondary:'#A1C6D0',accent:'#B69BFF',foreground:'#EEFCFF',muted:'#A7C7CE'},{effect:'glow',shape:'sharp'}),extraData:{category:'sci-fi',backgroundImagePath:'/assets/themes/cristal/background.jpg',backgroundImageDarkPath:'/assets/themes/cristal/background-dark.jpg',slideImagePath:'/assets/themes/cristal/slide.jpg',backgroundOpacity:{light:74,dark:46}}},
  { slug:'biopunk', name:'Biopunk', description:'Organic biotechnology, laboratories and unsettling living matter.', definition:makeTheme('biopunk','Biopunk',
    {background:'#EDF4E8',surface:'#F8FBF4',card:'#DDE8D6',border:'#71875E',primary:'#3E702B',secondary:'#4A5940',accent:'#8B3F59',foreground:'#172414',muted:'#4E6047'},
    {background:'#090D08',surface:'#11170E',card:'#192217',border:'#526B45',primary:'#79C956',secondary:'#A2B49A',accent:'#E07191',foreground:'#F1F7ED',muted:'#A9B9A2'},{effect:'pulse'}),extraData:{category:'sci-fi',backgroundImagePath:'/assets/themes/Biopunk/background.jpg',backgroundImageDarkPath:'/assets/themes/Biopunk/background-dark.jpg',backgroundOpacity:{light:76,dark:44}}},
  { slug:'gothic', name:'Gothic', description:'Cathedral stone, stained glass, candles and sacred darkness.', definition:makeTheme('gothic','Gothic',
    {background:'#E9E5E2',surface:'#F5F1ED',card:'#DDD7D2',border:'#665C63',primary:'#5B2338',secondary:'#494047',accent:'#7B5B25',foreground:'#1E171B',muted:'#574D53'},
    {background:'#09080A',surface:'#121014',card:'#1C181E',border:'#52464E',primary:'#A83E62',secondary:'#B9AAB3',accent:'#C19A51',foreground:'#F5EDF2',muted:'#B8AAB2'},{shape:'sharp',borderWidth:2}),extraData:{category:'horror',backgroundImagePath:'/assets/themes/Gothic/background.jpg',slideImagePath:'/assets/themes/Gothic/slide.jpg',backgroundOpacity:{light:76,dark:43}}},
  { slug:'solarpunk', name:'Solarpunk', description:'Optimistic ecological technology, sunlight and living architecture.', definition:makeTheme('solarpunk','Solarpunk',
    {background:'#EFF7E9',surface:'#FCFFF8',card:'#E0EED6',border:'#71A568',primary:'#317743',secondary:'#47644B',accent:'#CA8A16',foreground:'#17351E',muted:'#4F6C53'},
    {background:'#102016',surface:'#172B1E',card:'#203A28',border:'#568765',primary:'#83D69A',secondary:'#ABC6B0',accent:'#F2C14E',foreground:'#F2FFF4',muted:'#B0C8B4'},{shape:'pill'}),extraData:{category:'sci-fi',backgroundImagePath:'/assets/themes/solarpunk/background.jpg',slideImagePath:'/assets/themes/solarpunk/slide.jpg',backgroundOpacity:{light:78,dark:52}}},
  { slug:'dark-fantasy', name:'Dark Fantasy', description:'Ruined kingdoms, hostile magic and decadent medieval shadows.', definition:makeTheme('dark-fantasy','Dark Fantasy',
    {background:'#DCD6CC',surface:'#E9E3D9',card:'#CEC6B9',border:'#625649',primary:'#59352B',secondary:'#463D34',accent:'#7E551F',foreground:'#1D1814',muted:'#51483F'},
    {background:'#080706',surface:'#110E0C',card:'#1B1612',border:'#4F4035',primary:'#A85F49',secondary:'#B3A194',accent:'#C29342',foreground:'#F1E8DC',muted:'#B6A79B'},{shape:'sharp',borderWidth:2}),extraData:{category:'fantasy',backgroundImagePath:'/assets/themes/dark-fantasy/background.jpg',slideImagePath:'/assets/themes/dark-fantasy/slide.jpg',backgroundOpacity:{light:72,dark:40}}},
  { slug:'desert', name:'Desert', description:'Sun, dunes, ancient ruins and weathered copper.', definition:makeTheme('desert','Desert',
    {background:'#F2E3C7',surface:'#FFF3DA',card:'#E8D1A9',border:'#9B7549',primary:'#965522',secondary:'#6B543A',accent:'#B47725',foreground:'#302115',muted:'#70573E'},
    {background:'#21150D',surface:'#302016',card:'#402A1C',border:'#8D633D',primary:'#E39A55',secondary:'#C2AA8E',accent:'#E2B04D',foreground:'#FFF0D6',muted:'#C7AD8F'}),extraData:{category:'nature',backgroundImagePath:'/assets/themes/desert/background.jpg',slideImagePath:'/assets/themes/desert/slide.jpg',backgroundOpacity:{light:76,dark:48}}},
  { slug:'arctic', name:'Arctic', description:'Glacial light, snow, isolation and polar night.', definition:makeTheme('arctic','Arctic',
    {background:'#EEF7FA',surface:'#FCFFFF',card:'#DDECF2',border:'#7DA5B5',primary:'#296B8C',secondary:'#466574',accent:'#4B8EB5',foreground:'#102934',muted:'#4E6D7A'},
    {background:'#07131D',surface:'#0D202D',card:'#143042',border:'#416C82',primary:'#68B9E6',secondary:'#A7C5D3',accent:'#8CD5F5',foreground:'#EFFBFF',muted:'#AAC6D1'},{effect:'glow',shape:'sharp'}),extraData:{category:'nature',backgroundImagePath:'/assets/themes/Arctic/background.jpg',slideImagePath:'/assets/themes/Arctic/slide.jpg',backgroundOpacity:{light:78,dark:46}}},
  { slug:'military', name:'Military', description:'Tactical maps, olive equipment and field operations.', definition:makeTheme('military','Military',
    {background:'#DFDFD1',surface:'#ECEBDE',card:'#D0D1BE',border:'#66694F',primary:'#4F5D2F',secondary:'#454839',accent:'#826729',foreground:'#1E2117',muted:'#505443'},
    {background:'#11130D',surface:'#1A1D14',card:'#25291C',border:'#555B3C',primary:'#8FA55A',secondary:'#B0B59C',accent:'#C09A45',foreground:'#F1F2E7',muted:'#B2B7A0'},{shape:'sharp'}),extraData:{category:'historical',backgroundImagePath:'/assets/themes/Military/background.jpg',slideImagePath:'/assets/themes/Military/slide.jpg',backgroundOpacity:{light:76,dark:44}}},
  { slug:'post-apocalyptic', name:'Post-Apocalyptic', description:'Ruins, dust, rust and survival after collapse.', definition:makeTheme('post-apocalyptic','Post-Apocalyptic',
    {background:'#DCD7C9',surface:'#E9E4D8',card:'#CDC7B8',border:'#6E6250',primary:'#68512D',secondary:'#4E493E',accent:'#985328',foreground:'#211D17',muted:'#575146'},
    {background:'#0E0D0A',surface:'#181611',card:'#242018',border:'#5F5341',primary:'#B59150',secondary:'#B5AA99',accent:'#D16F38',foreground:'#F2EBDD',muted:'#B9AF9F'},{shape:'sharp',borderWidth:2}),extraData:{category:'sci-fi',backgroundImagePath:'/assets/themes/Post-Apocalyptic/background.jpg',slideImagePath:'/assets/themes/Post-Apocalyptic/slide.jpg',backgroundOpacity:{light:74,dark:42}}},
  { slug:'synthwave', name:'Synthwave', description:'Retro-futuristic night drives, magenta horizons and neon grids.', definition:makeTheme('synthwave','Synthwave',
    {background:'#F5EEFA',surface:'#FFF8FF',card:'#EADCF3',border:'#8C67B0',primary:'#7B2CBF',secondary:'#58456D',accent:'#D91E8A',foreground:'#25142F',muted:'#62516F'},
    {background:'#080519',surface:'#100924',card:'#1B0F36',border:'#7C3AED',primary:'#C744FF',secondary:'#BDA9D3',accent:'#FF2D9B',foreground:'#FFF4FF',muted:'#C2AFD2'},{effect:'glow',shape:'sharp'}),extraData:{category:'sci-fi',backgroundImagePath:'/assets/themes/Synthwave/background.jpg',slideImagePath:'/assets/themes/Synthwave/slide.jpg',backgroundOpacity:{light:72,dark:42}}},
  { slug:'industrial', name:'Industrial', description:'Modern factories, steel, concrete and safety orange.', definition:makeTheme('industrial','Industrial',
    {background:'#E4E6E7',surface:'#F2F3F3',card:'#D5D9DB',border:'#667077',primary:'#424D54',secondary:'#464F54',accent:'#B85A20',foreground:'#182024',muted:'#505B61'},
    {background:'#0E1113',surface:'#171B1E',card:'#22282C',border:'#4D5960',primary:'#788B95',secondary:'#AAB4B9',accent:'#E87A36',foreground:'#F2F5F6',muted:'#ACB6BB'},{shape:'sharp',borderWidth:2}),extraData:{category:'sci-fi',backgroundImagePath:'/assets/themes/Industrial/background.jpg',slideImagePath:'/assets/themes/Industrial/slide.jpg',backgroundOpacity:{light:76,dark:44}}},
  { slug:'alchemy', name:'Alchemy', description:'Ancient laboratories, transmutation diagrams and aged brass.', definition:makeTheme('alchemy','Alchemy',
    {background:'#EEE3C8',surface:'#FAF1DB',card:'#E2D2AE',border:'#8B7045',primary:'#6C5428',secondary:'#594C37',accent:'#8C6E24',foreground:'#292116',muted:'#655742',teal:'#3E7168'},
    {background:'#15130D',surface:'#211D14',card:'#30291C',border:'#6E5A36',primary:'#A78442',secondary:'#B8AA91',accent:'#D0A94E',foreground:'#F6EBD3',muted:'#BCAF96',teal:'#70A69C'},{effect:'glow'}),extraData:{category:'fantasy',backgroundImagePath:'/assets/themes/Alchemy/background.jpg',backgroundImageDarkPath:'/assets/themes/Alchemy/background-dark.jpg',slideImagePath:'/assets/themes/Alchemy/slide.jpg',backgroundOpacity:{light:76,dark:46}}},
  { slug:'ancient', name:'Ancient Ruins', description:'Weathered temples, stone carvings and forgotten civilizations.', definition:makeTheme('ancient','Ancient Ruins',
    {background:'#E9E0CE',surface:'#F6EEDD',card:'#DCD0B9',border:'#81735C',primary:'#67553A',secondary:'#51483A',accent:'#927136',foreground:'#282117',muted:'#5E5546'},
    {background:'#15130F',surface:'#201D17',card:'#2D2920',border:'#655B49',primary:'#A78C62',secondary:'#B8AE9E',accent:'#C6A05B',foreground:'#F2EBDD',muted:'#B8AFA0'}),extraData:{category:'historical',backgroundImagePath:'/assets/themes/Ancient/background.jpg',backgroundImageDarkPath:'/assets/themes/Ancient/background-dark.jpg',slideImagePath:'/assets/themes/Ancient/slide.jpg',backgroundOpacity:{light:76,dark:46}}},
  { slug:'celestial', name:'Celestial', description:'Divine marble temples and luminous kingdoms above the clouds.', definition:makeTheme('celestial','Celestial',
    {background:'#EEF3F7',surface:'#FFFFFF',card:'#F5F5F2',border:'#B8BDC5',primary:'#607D9B',secondary:'#68717C',accent:'#C5A253',foreground:'#252B32',muted:'#59636E',metallic:'#AEB5BF',gold:'#C5A253'},
    {background:'#111821',surface:'#1C2630',card:'#29333D',border:'#929BA6',primary:'#607D9B',secondary:'#AAB2BC',accent:'#D2B15F',foreground:'#F4F5F3',muted:'#ADB5BE',metallic:'#BCC3CB',gold:'#D2B15F'},{radius:{sm:6,md:12,lg:20,xl:28}}),extraData:{category:'fantasy',backgroundImagePath:'/assets/themes/Celestial/background.jpg',slideImagePath:'/assets/themes/Celestial/slide.jpg',backgroundOpacity:{light:78,dark:52}}},
  { slug:'detective', name:'Detective', description:'Rain, case files, dim offices and methodical investigation.', definition:makeTheme('detective','Detective',
    {background:'#E8E2D7',surface:'#F4EFE6',card:'#DAD2C4',border:'#69625A',primary:'#3E4549',secondary:'#4B4944',accent:'#855C2C',foreground:'#1D2021',muted:'#55534E'},
    {background:'#0D1012',surface:'#151A1D',card:'#20272A',border:'#4B5559',primary:'#526A73',secondary:'#A8B0B2',accent:'#B4874B',foreground:'#F0F2F1',muted:'#AAB1B2'},{shape:'sharp'}),extraData:{category:'graphic',backgroundImagePath:'/assets/themes/Detective/background.jpg',slideImagePath:'/assets/themes/Detective/slide.avif',backgroundOpacity:{light:76,dark:44}}},
  { slug:'dieselpunk', name:'Dieselpunk', description:'Heavy machines, smoke and interwar industrial retrofuturism.', definition:makeTheme('dieselpunk','Dieselpunk',
    {background:'#DAD8CC',surface:'#E8E6DA',card:'#CAC8BA',border:'#626357',primary:'#505442',secondary:'#45473F',accent:'#8B5A2B',foreground:'#1D2019',muted:'#505248',metallic:'#6A706C'},
    {background:'#10110E',surface:'#191B16',card:'#25271F',border:'#555849',primary:'#747D5B',secondary:'#ADB09E',accent:'#C27B3F',foreground:'#F0F1E8',muted:'#B1B3A3',metallic:'#858C86'},{shape:'sharp',borderWidth:2}),extraData:{category:'sci-fi',backgroundImagePath:'/assets/themes/Dieselpunk/background.jpg',slideImagePath:'/assets/themes/Dieselpunk/slide.jpg',backgroundOpacity:{light:74,dark:42}}},
  { slug:'fairy', name:'Fairy', description:'Enchanted forests, fireflies and gentle otherworldly magic.', definition:makeTheme('fairy','Fairy',
    {background:'#EFF7EE',surface:'#FAFFF9',card:'#E1F0E0',border:'#82A982',primary:'#477D58',secondary:'#536B58',accent:'#A75F96',foreground:'#1C3423',muted:'#58705D',teal:'#3D8A7A'},
    {background:'#0B1712',surface:'#12231B',card:'#1A3226',border:'#4D795F',primary:'#75BE8D',secondary:'#A8C5AF',accent:'#E08DCF',foreground:'#F0FFF4',muted:'#ADCCB6',teal:'#62C4AD'},{effect:'glow',shape:'pill'}),extraData:{category:'fantasy',backgroundImagePath:'/assets/themes/Fairy/background.jpg',backgroundImageDarkPath:'/assets/themes/Fairy/background-dark.jpg',slideImagePath:'/assets/themes/Fairy/slide.jpg',backgroundOpacity:{light:78,dark:48}}},
  { slug:'ink', name:'Ink', description:'Ivory paper, expressive brushwork and monochrome illustration.', definition:makeTheme('ink','Ink',
    {background:'#F1EDE3',surface:'#FBF8F0',card:'#E6E0D4',border:'#57544E',primary:'#292B2C',secondary:'#494742',accent:'#6D3D32',foreground:'#171818',muted:'#55524C'},
    {background:'#141413',surface:'#1E1E1C',card:'#292824',border:'#5B5952',primary:'#55514A',secondary:'#B8B4AA',accent:'#B87362',foreground:'#F2EFE8',muted:'#B7B3AA'},{shape:'sharp'}),extraData:{category:'graphic',backgroundImagePath:'/assets/themes/Ink/background.jpg',slideImagePath:'/assets/themes/Ink/slide.jpg',backgroundOpacity:{light:80,dark:52}}},
  { slug:'vaporwave', name:'Vaporwave', description:'Dreamlike retro computing, pastel sunsets and digital nostalgia.', definition:makeTheme('vaporwave','Vaporwave',
    {background:'#F8EEFA',surface:'#FFF8FF',card:'#EEDFF2',border:'#B581BD',primary:'#8A4D9F',secondary:'#67536D',accent:'#D85F9F',foreground:'#321B38',muted:'#6E5A73',teal:'#399FA5'},
    {background:'#160D25',surface:'#211232',card:'#301944',border:'#8C56A5',primary:'#A85FC2',secondary:'#C6ADD0',accent:'#FF7AC3',foreground:'#FFF3FF',muted:'#CBB4D2',teal:'#57D0D4'},{effect:'glow',shape:'pill'}),extraData:{category:'graphic',backgroundImagePath:'/assets/themes/Vaporwave/background.jpg',backgroundImageDarkPath:'/assets/themes/Vaporwave/background-dark.jpg',slideImagePath:'/assets/themes/Vaporwave/slide.jpg',backgroundOpacity:{light:76,dark:44}}},
  { slug:'victorian', name:'Victorian', description:'Nineteenth-century interiors, ornate paper and restrained elegance.', definition:makeTheme('victorian','Victorian',
    {background:'#EDE4D4',surface:'#F8F0E2',card:'#DED2BD',border:'#78664E',primary:'#5B4934',secondary:'#554A3D',accent:'#7A5437',foreground:'#281F17',muted:'#625648',gold:'#90713D'},
    {background:'#17120E',surface:'#241B15',card:'#33261D',border:'#6A5541',primary:'#8A6849',secondary:'#BCAE9F',accent:'#B98055',foreground:'#F5E9D8',muted:'#C1B19F',gold:'#C09A55'}),extraData:{category:'historical',backgroundImagePath:'/assets/themes/Victorian/background.jpg',backgroundImageDarkPath:'/assets/themes/Victorian/background-dark.jpg',slideImagePath:'/assets/themes/Victorian/slide.jpg',backgroundOpacity:{light:78,dark:48}}},
  { slug:'volcanic', name:'Volcanic', description:'Black rock, molten lava and overwhelming geothermal heat.', definition:makeTheme('volcanic','Volcanic',
    {background:'#DED9D4',surface:'#ECE8E4',card:'#D0C9C3',border:'#62534D',primary:'#79351F',secondary:'#4C423E',accent:'#B84B1D',foreground:'#211916',muted:'#554A46',orange:'#B84B1D'},
    {background:'#090706',surface:'#120D0B',card:'#1E1511',border:'#59372B',primary:'#A84724',secondary:'#B6A49E',accent:'#FF692E',foreground:'#FFF1EA',muted:'#C0AAA2',orange:'#FF692E'},{effect:'pulse',shape:'sharp'}),extraData:{category:'nature',backgroundImagePath:'/assets/themes/Volcanic/background.jpg',slideImagePath:'/assets/themes/Volcanic/slide.avif',backgroundOpacity:{light:72,dark:38}}},
];

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    for (const theme of themes) {
      await client.query(
        `INSERT INTO themes (id, slug, name, description, definition, "extraData", "isActive", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb, true, NOW(), NOW())
         ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, definition = EXCLUDED.definition, "extraData" = EXCLUDED."extraData", "isActive" = true, "updatedAt" = NOW()`,
        [randomUUID(), theme.slug, theme.name, theme.description, JSON.stringify(theme.definition), JSON.stringify(theme.extraData)],
      );
    }
    console.log(`${themes.length} thèmes de démonstration synchronisés.`);

    const userResult = await client.query<{ id: string; email: string }>(
      'SELECT id, email FROM users ORDER BY "createdAt" ASC LIMIT 1',
    );
    const user = userResult.rows[0];
    if (!user) {
      console.log('Aucun utilisateur : le projet de démonstration est ignoré.');
      return;
    }

    const existing = await client.query<{ id: string }>(
      'SELECT id FROM projects WHERE title = $1 AND "ownerId" = $2 LIMIT 1',
      ['Projet de test Gateway', user.id],
    );
    if (existing.rows[0]) console.log(`Seed déjà présent: ${existing.rows[0].id}`);
    else {
      const projectId = randomUUID();
      await client.query('BEGIN');
      await client.query(
      'INSERT INTO projects (id, title, description, "ownerId", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, NOW(), NOW())',
      [projectId, 'Projet de test Gateway', 'Projet créé par le seed pour tester gateway, session et permissions.', user.id],
    );
      await client.query(
      'INSERT INTO project_accesses (id, "projectId", "userId", actions, note, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4::"ProjectAction"[], $5, NOW(), NOW())',
      [randomUUID(), projectId, user.id, ['VIEW', 'EDIT_PROJECT', 'MANAGE_ACCESS', 'DELETE_PROJECT'], 'Accès propriétaire créé par le seed'],
    );
      await client.query('COMMIT');
      console.log(`Projet seed créé: ${projectId} pour ${user.email}`);
    }
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined);
    throw error;
  } finally {
    await client.end();
  }
}

void main();
