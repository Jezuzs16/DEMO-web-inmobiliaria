import { useMemo, useRef, useState } from 'react';
import { Calculator, TrendingUp } from 'lucide-react';
import { gsap, useGSAP } from '../../../lib/gsap';
import { SplitRevealText } from '../../../components/react-bits/SplitRevealText';
import { formatUSD } from '../../../lib/format';

const INTEREST_RATE = 0.085;

export function PurchaseSimulator() {
  const root = useRef<HTMLElement>(null);
  const [price, setPrice] = useState(85000);
  const [downPct, setDownPct] = useState(30);
  const [years, setYears] = useState(10);

  const { downPayment, balance, monthly, total } = useMemo(() => {
    const down = price * (downPct / 100);
    const principal = price - down;
    const months = years * 12;
    const monthlyRate = INTEREST_RATE / 12;
    const payment =
      principal > 0
        ? (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months))
        : 0;
    return {
      downPayment: down,
      balance: principal,
      monthly: payment,
      total: payment * months,
    };
  }, [price, downPct, years]);

  useGSAP(
    () => {
      gsap.fromTo(
        '[data-sim-card]',
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: root.current,
            start: 'top 82%',
            once: true,
          },
        },
      );
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="simulador"
      className="scroll-mt-24 bg-stone-soft/70 py-24 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <p className="mb-5 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.24em] text-brand-cyan">
          <span className="h-px w-8 bg-brand-yellow" />
          Simulador de compra
        </p>
        <SplitRevealText
          as="h2"
          text="Visualiza tu inversión antes de dar el paso."
          underline={['inversión']}
          className="max-w-3xl font-display text-[clamp(2rem,4.3vw,3.5rem)] font-extrabold leading-tight text-navy"
        />
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-navy/55">
          Ajusta los valores y conoce al instante tu inicial, el saldo a
          financiar y una cuota mensual referencial en dólares.
        </p>

        <div
          data-sim-card
          className="mt-10 grid gap-0 overflow-hidden rounded-3xl border border-line bg-white shadow-[0_25px_70px_-45px_rgba(16,35,49,0.6)] lg:grid-cols-[1.1fr_0.9fr]"
        >
          <div className="space-y-9 p-7 sm:p-10">
            <Slider
              id="sim-price"
              label="Valor de la Propiedad ($)"
              value={price}
              display={formatUSD(price)}
              min={50000}
              max={600000}
              step={5000}
              onChange={setPrice}
            />
            <Slider
              id="sim-down"
              label="Inicial (%)"
              value={downPct}
              display={`${downPct}% · ${formatUSD(Math.round(downPayment))}`}
              min={10}
              max={70}
              step={1}
              onChange={setDownPct}
            />
            <Slider
              id="sim-years"
              label="Plazo de Pago (meses/años)"
              value={years}
              display={`${years} años · ${years * 12} meses`}
              min={2}
              max={25}
              step={1}
              onChange={setYears}
            />
            <p className="text-xs text-navy/45">
              Tasa referencial del {(INTEREST_RATE * 100).toFixed(1)}% anual.
              El resultado es orientativo y no constituye una oferta de crédito.
            </p>
          </div>

          <div className="relative overflow-hidden bg-navy p-8 sm:p-10">
            <div
              aria-hidden="true"
              className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-brand-yellow/10 blur-3xl"
            />
            <div className="relative flex h-full flex-col justify-between">
              <div>
                <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-yellow">
                  <Calculator size={14} /> Resultado referencial
                </span>
                <p className="mt-8 text-xs font-semibold uppercase tracking-wider text-white/60">
                  Cuota mensual
                </p>
                <p className="mt-2 font-display text-[clamp(2.25rem,4.5vw,3.25rem)] font-extrabold leading-none text-brand-yellow">
                  {formatUSD(Math.round(monthly))}
                </p>
              </div>

              <div className="mt-10 space-y-4 border-t border-white/15 pt-6">
                <ResultRow label="Inicial" value={formatUSD(Math.round(downPayment))} highlighted />
                <ResultRow label="Saldo a financiar" value={formatUSD(Math.round(balance))} />
                <ResultRow label="Total estimado a pagar" value={formatUSD(Math.round(total))} />
              </div>

              <p className="mt-8 flex items-center gap-2 text-[11px] text-brand-sky">
                <TrendingUp size={14} /> Actualización en tiempo real · USD
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

interface SliderProps {
  id: string;
  label: string;
  value: number;
  display: string;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}

function Slider({
  id,
  label,
  value,
  display,
  min,
  max,
  step,
  onChange,
}: SliderProps) {
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-sm font-bold text-navy">
          {label}
        </label>
        <span className="font-display text-sm font-extrabold text-brand-cyan">
          {display}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="range-brand w-full"
      />
    </div>
  );
}

function ResultRow({
  label,
  value,
  highlighted = false,
}: {
  label: string;
  value: string;
  highlighted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-white/60">{label}</span>
      <span
        className={`font-bold ${highlighted ? 'text-brand-yellow' : 'text-white'}`}
      >
        {value}
      </span>
    </div>
  );
}
