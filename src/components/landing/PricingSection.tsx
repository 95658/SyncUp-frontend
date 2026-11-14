'use client';

import React, { useState } from 'react';
import { useUIStore } from '@/store/uiStore';
import { Check, Sparkles, Shield, Zap, Clock, ArrowRight } from 'lucide-react';

interface PricingTier {
  id: string;
  nameEn: string;
  nameAr: string;
  billingPeriodEn: string;
  billingPeriodAr: string;
  priceDisplayEn: string;
  priceDisplayAr: string;
  perMonthDisplayEn: string;
  perMonthDisplayAr: string;
  popular?: boolean;
  savingsEn?: string;
  savingsAr?: string;
  featuresEn: string[];
  featuresAr: string[];
  buttonTextEn: string;
  buttonTextAr: string;
}

export const PricingSection: React.FC<{ onRequestAccess: () => void }> = ({ onRequestAccess }) => {
  const { language } = useUIStore();
  const isAr = language === 'ar';
  const [selectedPlan, setSelectedPlan] = useState<string>('trial');

  const tiers: PricingTier[] = [
    {
      id: 'trial',
      nameEn: '14-Day Free Trial',
      nameAr: 'تجربة مجانية (14 يوماً)',
      priceDisplayEn: '$0',
      priceDisplayAr: '$0',
      perMonthDisplayEn: 'Free for 14 Days',
      perMonthDisplayAr: 'مجاناً لمدة 14 يوماً',
      billingPeriodEn: 'no credit card required • instant access',
      billingPeriodAr: 'بدون بطاقة بنكية • تفعيل فوري',
      savingsEn: '100% Free',
      savingsAr: 'مجاناً 100%',
      featuresEn: [
        'Full Enterprise Workspace access',
        'Unlimited sprints, tasks & poker planning',
        'Encrypted team channels & direct messages',
        'Unlimited client project management',
        'Standard cloud file storage',
        'Official email invite token activation',
      ],
      featuresAr: [
        'وصول كامل وشامل لبيئة العمل المؤسسية',
        'عدد غير محدود من السبرنتات والمهام والتخطيط',
        'قنوات دردشة مشفرة ومحادثات مباشرة',
        'إدارة مشاريع العملاء بلا حدود',
        'مساحة تخزين سحابية قياسية للملفات',
        'تفعيل فوري عبر رابط دعوة رسمي للمؤسسة',
      ],
      buttonTextEn: 'Start 14-Day Free Trial',
      buttonTextAr: 'ابدأ تجربتك المجانية',
    },
    {
      id: 'monthly',
      nameEn: 'Monthly Pass',
      nameAr: 'الاشتراك الشهري',
      priceDisplayEn: '$49',
      priceDisplayAr: '$49',
      perMonthDisplayEn: '/ month',
      perMonthDisplayAr: '/ شهر',
      billingPeriodEn: 'billed monthly • cancel anytime',
      billingPeriodAr: 'تُدفع شهرياً • إلغاء في أي وقت',
      featuresEn: [
        'Everything in Free Trial',
        'Uninterrupted continuous workspace',
        'Standard cloud file deliverables storage',
        'Priority email & ticket support',
        'Multi-team workspace isolation',
      ],
      featuresAr: [
        'كل ما يتضمنه الحساب التجريبي',
        'استمرارية الخدمة والبيانات دون توقف',
        'تخزين سحابي قياسي للملفات والتسليمات',
        'دعم فني ذو أولوية عبر البريد والتذاكر',
        'عزل تام للمشاريع بين الفرق المختلفة',
      ],
      buttonTextEn: 'Choose Monthly Pass',
      buttonTextAr: 'اختر الاشتراك الشهري',
    },
    {
      id: 'half_year',
      nameEn: '6-Month Growth',
      nameAr: 'باقة الـ 6 شهور',
      priceDisplayEn: '$39',
      priceDisplayAr: '$39',
      perMonthDisplayEn: '/ mo ($239)',
      perMonthDisplayAr: '/ شهر ($239)',
      billingPeriodEn: 'billed every 6 months • save $60',
      billingPeriodAr: 'تُدفع كل 6 شهور • توفير $60',
      savingsEn: 'Save 20%',
      savingsAr: 'وفر 20%',
      featuresEn: [
        'Everything in Monthly Pass',
        'Advanced audit logs & compliance trail',
        'Automated CI/CD webhook integrations',
        'Higher capacity file deliverables',
        'Dedicated onboarding support',
      ],
      featuresAr: [
        'كل مميزات الاشتراك الشهري',
        'سجلات تدقيق أمني مفصلة (Audit Logs)',
        'تكاملات Webhook للـ CI/CD والربط الآلي',
        'سعة مضاعفة لتسليمات الملفات والتصميمات',
        'دعم مهندس مخصص أثناء الإطلاق والإعداد',
      ],
      buttonTextEn: 'Choose 6-Month Plan',
      buttonTextAr: 'اختر باقة الـ 6 شهور',
    },
    {
      id: 'annual',
      nameEn: 'Annual Enterprise',
      nameAr: 'الاشتراك السنوي الشامل',
      priceDisplayEn: '$33',
      priceDisplayAr: '$33',
      perMonthDisplayEn: '/ mo ($399)',
      perMonthDisplayAr: '/ شهر ($399)',
      billingPeriodEn: 'billed annually • 2 months completely free',
      billingPeriodAr: 'تُدفع سنوياً • شهران مجاناً بالكامل',
      popular: true,
      savingsEn: 'Save 32% (Best Value)',
      savingsAr: 'وفر 32% (القيمة الأفضل)',
      featuresEn: [
        'Full unlimited platform capabilities',
        '2 months completely free ($99 savings)',
        'Guaranteed 99.99% uptime SLA',
        'Custom domain & white-label options',
        'VIP direct Slack/WhatsApp bridge with core team',
      ],
      featuresAr: [
        'كل مميزات وقدرات المنصة بلا أي قيود',
        'شهران مجاناً بالكامل (توفير $99)',
        'اتفاقية مستوى الخدمة 99.99% SLA',
        'إمكانية ربط نطاق مخصص للهوية المؤسسية',
        'قناة تواصل VIP مباشرة مع الفريق الهندسي',
      ],
      buttonTextEn: 'Choose Annual Plan',
      buttonTextAr: 'اختر الاشتراك السنوي',
    },
  ];

  return (
    <section
      id="pricing"
      style={{
        padding: '90px 24px',
        maxWidth: '1320px',
        margin: '0 auto',
        width: '100%',
        position: 'relative',
      }}
    >
      {/* Section Header */}
      <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 50px auto' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            background: 'var(--primary-light)',
            border: '1px solid var(--primary-border)',
            borderRadius: '999px',
            color: 'var(--primary)',
            fontSize: '13px',
            fontWeight: 800,
            marginBottom: '18px',
          }}
        >
          <Sparkles size={15} />
          <span>{isAr ? 'تجربة مجانية شاملة + خطط مرنة' : '14-Day Free Trial & Transparent Plans'}</span>
        </div>
        <h2 style={{ fontSize: ' clamp(28px, 4vw, 42px)', fontWeight: 900, color: 'var(--text-main)', letterSpacing: isAr ? '0' : '-1px', lineHeight: 1.18 }}>
          {isAr
            ? 'ابدأ تجربة مجانية 14 يوماً مع فريقك بدون مخاطرة'
            : 'Start with 14 days free. Scale when you are ready.'}
        </h2>
        <p style={{ fontSize: '16px', color: 'var(--text-secondary)', marginTop: '14px', lineHeight: 1.6 }}>
          {isAr
            ? 'تمتع بكافة الخصائص المؤسسية مجاناً لأول أسبوعين. بدون الحاجة لإدخال أي بطاقة دفع، ويمكنك اختيار الباقة التي تناسبك بعد التجربة.'
            : 'Full enterprise features available immediately for your entire team. No credit card required to start.'}
        </p>
      </div>

      {/* Pricing Cards Grid - 4 Columns */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          alignItems: 'stretch',
          paddingTop: '20px', // Prevents any floating badges from being clipped
        }}
      >
        {tiers.map((tier) => {
          const isSelected = selectedPlan === tier.id;

          return (
            <div
              key={tier.id}
              onClick={() => setSelectedPlan(tier.id)}
              className="card hover-lift"
              style={{
                padding: '32px 24px',
                borderRadius: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                cursor: 'pointer',
                // Burgundy border when selected
                border: isSelected
                  ? '2px solid var(--primary)'
                  : tier.popular
                  ? '2px solid rgba(139, 0, 33, 0.45)'
                  : '1px solid var(--border-light)',
                // Burgundy glow and background tint when selected
                background: isSelected
                  ? 'linear-gradient(180deg, var(--bg-surface) 0%, rgba(139, 0, 33, 0.08) 100%)'
                  : 'var(--bg-surface)',
                boxShadow: isSelected
                  ? '0 0 0 3px rgba(139, 0, 33, 0.35), 0 14px 34px -4px rgba(139, 0, 33, 0.25)'
                  : 'var(--shadow-card)',
                transform: isSelected ? 'scale(1.02)' : 'none',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {/* Popular Badge - Properly Centered & Unclipped */}
              {tier.popular && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-14px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'var(--primary-gradient)',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    padding: '5px 16px',
                    borderRadius: '999px',
                    boxShadow: '0 4px 14px rgba(139, 0, 33, 0.4)',
                    whiteSpace: 'nowrap',
                    zIndex: 10,
                  }}
                >
                  {isAr ? 'الأكثر طلباً وتوفيراً' : 'Most Popular'}
                </div>
              )}

              {/* Free Trial Tag */}
              {tier.id === 'trial' && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-14px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: isSelected ? 'var(--primary-gradient)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    padding: '5px 16px',
                    borderRadius: '999px',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
                    whiteSpace: 'nowrap',
                    zIndex: 10,
                  }}
                >
                  {isAr ? 'تجربة مجانية 14 يوماً' : '14-Day Free Trial'}
                </div>
              )}

              <div>
                {/* Header row: Title + Savings pill */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)' }}>
                    {isAr ? tier.nameAr : tier.nameEn}
                  </h3>
                  {tier.savingsEn && (
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        color: 'var(--primary)',
                        background: 'var(--primary-light)',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        border: '1px solid var(--primary-border)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {isAr ? tier.savingsAr : tier.savingsEn}
                    </span>
                  )}
                </div>

                {/* Price Display */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', margin: '18px 0 4px 0' }}>
                  <span style={{ fontSize: '42px', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-1.5px', lineHeight: 1 }}>
                    {isAr ? tier.priceDisplayAr : tier.priceDisplayEn}
                  </span>
                  <span style={{ fontSize: '13.5px', color: 'var(--text-secondary)', fontWeight: 700 }}>
                    {isAr ? tier.perMonthDisplayAr : tier.perMonthDisplayEn}
                  </span>
                </div>

                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '22px' }}>
                  {isAr ? tier.billingPeriodAr : tier.billingPeriodEn}
                </div>

                {/* Features List */}
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '18px', marginBottom: '24px' }}>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '11px' }}>
                    {(isAr ? tier.featuresAr : tier.featuresEn).map((feat, idx) => (
                      <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                        <div
                          style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            background: isSelected ? 'var(--primary)' : 'var(--primary-light)',
                            color: isSelected ? '#ffffff' : 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            marginTop: '2px',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <Check size={11} strokeWidth={3} />
                        </div>
                        <span style={{ lineHeight: 1.45 }}>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Call to Action Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPlan(tier.id);
                  onRequestAccess();
                }}
                className={isSelected || tier.popular ? 'btn btn-primary' : 'btn btn-secondary'}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '13.5px',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: isSelected ? 'var(--primary-glow)' : undefined,
                }}
              >
                <span>{isAr ? tier.buttonTextAr : tier.buttonTextEn}</span>
                <ArrowRight size={15} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Security & Money-back Guarantee note */}
      <div style={{ textAlign: 'center', marginTop: '48px', color: 'var(--text-muted)', fontSize: '13.5px' }}>
        <Shield size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
        <span>
          {isAr
            ? 'تشفير كامل لكافة قنوات وبيانات المؤسسة. ضمان استرجاع الأموال لمدة 30 يوماً على جميع الباقات المدفوعة.'
            : 'All plans include end-to-end multi-tenant database isolation, daily backups, and a 30-day money-back guarantee.'}
        </span>
      </div>
    </section>
  );
};
