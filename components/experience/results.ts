/**
 * Plain labels for results, taken from the owner's own sentences (nothing invented): each percentage with
 * what it measured and which way it moved. "reducing deployment time by 40%" gives -40% deployment time;
 * "achieving 98% WCAG 2.1 accessibility compliance" gives 98% WCAG 2.1 accessibility compliance.
 */
export interface Figure { value: number; sign: '' | '+' | '−'; label: string }
export interface Result { company: string; position: string; line: string; figures: Figure[]; tag: string }

const LEAD = /^(and|a|an|the|reducing|reduced|reduce|improving|improved|improve|increasing|increased|increase|enhancing|enhanced|enhance|achieving|achieved|cutting|cut|lowering|lowered|boosting|boosted|ensured|ensuring|developed|developing|led|leading)\s+/i;
const DOWN = /\b(reduc\w*|cut\w*|lower\w*|decreas\w*)\b/i;
const UP = /\b(improv\w*|increas\w*|enhanc\w*|boost\w*)\b/i;

function strip(s: string) {
  let t = s.trim();
  for (let i = 0; i < 4 && LEAD.test(t); i++) t = t.replace(LEAD, '');
  return t.replace(/[()]/g, '').trim();
}

export function figuresOf(line: string): Figure[] {
  const out: Figure[] = [];
  const re = /(\d+)%/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line))) {
    const value = Number(m[1]);
    const before = line.slice(0, m.index), after = line.slice(m.index + m[0].length);
    const by = before.match(/([^,]*?)\s+by\s*$/i);
    let clause = '', sign: Figure['sign'] = '';
    if (by) {
      // "..., reducing deployment time by 40%": the clause before "by", after its last "and"
      clause = by[1].split(/\band\b/i).pop() || by[1];
      // "Reduced costs by 30% and server downtime by 25%": the second figure shares the first one's verb
      const verb = DOWN.test(clause) || UP.test(clause) ? clause : by[1];
      sign = DOWN.test(verb) ? '−' : UP.test(verb) ? '+' : '';
    } else {
      // "a 40% reduction in latency" or "98% WCAG 2.1 accessibility compliance": the words after the figure
      clause = after.split(/[,;]|\.(?=\s|$)|\band\b|\bthrough\b|\bby\b|\bwith\b/i)[0];
      sign = /^\s*reduction/i.test(clause) ? '−' : /^\s*increase/i.test(clause) ? '+' : '';
      clause = clause.replace(/^\s*(reduction|increase)\s+in\s+/i, '');
    }
    const words = strip(clause).split(/\s+/).filter(Boolean);
    out.push({ value, sign, label: words.slice(-5).join(' ') });
  }
  return out;
}

/** A short name for a result with no figure: its first phrase, without the verb. */
function tagOf(line: string) {
  return strip(line).split(/\s+(of|for|from|to|by|with|through)\s+/i)[0].split(/\s+/).slice(0, 4).join(' ');
}

export function resultsOf(roles: Array<{ company: string; position: string; achievements: string[] }>): Result[] {
  return roles.flatMap((r) => r.achievements.map((line) => {
    const figures = figuresOf(line);
    return { company: r.company, position: r.position, line: line.trim().replace(/\.\s*$/, '') + '.', figures, tag: figures.length ? figures[0].label : tagOf(line) };
  }));
}

export const showFigure = (f: Figure) => `${f.sign}${f.value}%`;
