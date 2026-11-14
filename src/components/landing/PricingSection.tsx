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
  price: number;
  perMonth: number;
  popular?: boolean;
  savingsEn?: string;
  savingsAr?: string;
  featuresEn: string[];
  featuresAr: string[];
}

export const PricingSection: React.FC<{ onRequestAccess: () => void }> = ({ onRequestAccess }) => {
  const { language } = useUIStore();
  const isAr = language === 'ar';
  const [selectedPlan, setSelectedPlan] = useState<string>('annual');

  const tiers: PricingTier[] = [
    {
      id: 'monthly',
      nameEn: 'Monthly Pass',
      nameAr: 'الاشتراك الشهري',
      billingPeriodEn: 'per month',
      billingPeriodAr: 'شهرياً',
      price: 49,
      perMonth: 49,
      featuresEn: [
        'Full Enterprise Workspace access',
        'Unlimited sprints, tasks & poker planning',
        'Encrypted team channels & direct messages',
        'Unlimited client project management',
        'Standard cloud file storage',
      ],
      featuresAr: [
        'وصول كامل لبيئة العمل المؤسسية',
        'عدد غير محدود من السبرنتات والتخطيط',
        'قنوات دردشة مشفرة ورسائل مباشرة',
        'إدارة مشاريع العملاء بلا حدود',
        'مساحة تخزين سحابية قياسية',
      ],
    },
    {
      id: 'quarterly',
      nameEn: '3-Month Sprint',
      nameAr: 'باقة الـ 3 شهور',
      billingPeriodEn: 'billed every 3 months',
      billingPeriodAr: 'تُدفع كل 3 شهور ($129)',
      price: 129,
      perMonth: 43,
      savingsEn: 'Save 12%',
      savingsAr: 'وفر 12%',
      featuresEn: [
        'Everything in Monthly Pass',
        'Priority support response within 4 hours',
        'Custom team roles & project permissions',
        'Sprint performance & velocity analytics',
        'Multi-team workspace isolation',
      ],
      featuresAr: [
        'كل ما في الباقة الشهرية',
        'دعم فني ذو أولوية خلال 4 ساعات',
        'أدوار مخصصة وصلاحيات مرنة للفرق',
        'تحليلات سرعة الإنجاز والأداء',
        'عزل تام للمشاريع بين الفرق المختلفة',
      ],
    },
    {
      id: 'half_year',
      nameEn: '6-Month Growth',
      nameAr: 'باقة الـ 6 شهور',
      billingPeriodEn: 'billed every 6 months',
      billingPeriodAr: 'تُدفع كل 6 شهور ($239)',
      price: 239,
      perMonth: 39,
      savingsEn: 'Save 20%',
      savingsAr: 'وفر 20%',
      featuresEn: [
        'Everything in 3-Month Plan',
        'Advanced audit logs & compliance trail',
        'Automated CI/CD webhook integrations',
        'Higher capacity file deliverables',
        'Dedicated onboarding engineer support',
      ],
      featuresAr: [
        'كل ما في باقة الـ 3 شهور',
        'سجلات تدقيق أمني مفصلة (Audit Logs)',
        'تكاملات Webhook للـ CI/CD والربط الآلي',
        'سعة مضاعفة لتسليمات الملفات والتصميمات',
        'دعم مهندس مخصص أثناء الإطلاق والإعداد',
      ],
    },
    {
      id: 'annual',
      nameEn: 'Annual Enterprise',
      nameAr: 'الاشتراك السنوي الشامل',
      billingPeriodEn: 'billed annually ($399)',
      billingPeriodAr: 'تُدفع سنوياً ($399)',
      price: 399,
      perMonth: 33,
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
        'كل مميزات وقدرات المنصة بلا حدود',
        'شهران مجاناً بالكامل (توفير $99)',
        'اتفاقية مستوى الخدمة 99.99% SLA',
        'إمكانية ربط نطاق مخصص للهوية المؤسسية',
        'قناة تواصل VIP مباشرة مع الفريق الهندسي',
      ],
    },
  ];

  return (
    <section
      id="pricing"
      style={{
        padding: '100px 24px',
        maxWidth: '1280px',
        margin: '0 auto',
        width: '100%',
        position: 'relative',
      }}
    >
      {/* Trial Banner Callout */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(139, 0, 33, 0.08) 0%, rgba(190, 18, 60, 0.04) 100%)',
          border: '1.5px solid var(--primary-border)',
          borderRadius: '20px',
          padding: '24px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px',
          marginBottom: '54px',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: 'var(--primary-glow)',
              flexShrink: 0,
            }}
          >
            <Clock size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  background: '#ffe4e6',
                  color: '#9f1239',
                  padding: '3px 10px',
                  borderRadius: '999px',
                }}
              >
                {isAr ? 'تجربة مجانية شاملة' : '14-Day Free Trial'}
              </span>
              <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                {isAr ? 'بدون أي التزام أو بطاقة بنكية' : 'No credit card required'}
              </span>
            </div>
            <h3 style={{ fontSize: '19px', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
              {isAr
                ? 'جرب منصة SyncUp بالكامل مجاناً لمدة 14 يوماً مع فريقك'
                : 'Experience the full SyncUp workspace free for 14 days with your entire engineering team'}
            </h3>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '2px', margin: 0 }}>
              {isAr
                ? 'ابدأ فوراً واستمتع بكافة الخصائص الاحترافية بدون أي قيود، واختر خطة الاشتراك المناسبة لك لاحقاً.'
                : 'Every new organization starts with 14 days of unrestricted enterprise access before selecting a plan.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onRequestAccess}
          className="btn btn-primary"
          style={{
            padding: '12px 24px',
            fontSize: '14.5px',
            fontWeight: 800,
            borderRadius: '12px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>{isAr ? 'ابدأ تجربتك المجانية (14 يوماً)' : 'Start 14-Day Free Trial'}</span>
          <ArrowRight size={16} />
        </button>
      </div>

      {/* Section Header */}
      <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 60px auto' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            background: 'var(--primary-light)',
            border: '1px solid var(--primary-border)',
            borderRadius: '999px',
            color: 'var(--primary)',
            fontSize: '12.5px',
            fontWeight: 700,
            marginBottom: '16px',
          }}
        >
          <Sparkles size={14} />
          <span>{isAr ? 'خطط أسعار واضحة ومرنة' : 'Simple, Transparent Pricing'}</span>
        </div>
        <h2 style={{ fontSize: '38px', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.8px', lineHeight: 1.15 }}>
          {isAr
            ? 'خطط مرنة تناسب وتيرة نمو فريقك الهندسي'
            : 'Plans built for teams of every velocity'}
        </h2>
        <p style={{ fontSize: '16px', color: 'var(--text-secondary)', marginTop: '12px', lineHeight: 1.6 }}>
          {isAr
            ? 'لا توجد أي رسوم خفية لكل مستخدم. تدفع المؤسسة اشتراكاً ثابتاً وتستمتع بكافة الأدوات والقنوات والمهام.'
            : 'Flat transparent billing per tenant organization. No per-seat extortion fees.'}
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '24px',
          alignItems: 'stretch',
        }}
      >
        {tiers.map((tier) => {
          const isSelected = selectedPlan === tier.id;
          return (
            <div
              key={tier.id}
              onClick={() => setSelectedPlan(tier.id)}
              className="card"
              style={{
                padding: '32px 24px',
                borderRadius: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                cursor: 'pointer',
                border: tier.popular
                  ? '2px solid var(--primary)'
                  : isSelected
                  ? '2px solid var(--primary-border)'
                  : '1px solid var(--border-light)',
                background: tier.popular
                  ? 'linear-gradient(180deg, var(--bg-surface) 0%, rgba(139, 0, 33, 0.02) 100%)'
                  : 'var(--bg-surface)',
                boxShadow: tier.popular ? 'var(--shadow-lg), var(--primary-glow)' : 'var(--shadow-card)',
                transform: tier.popular ? 'scale(1.02)' : 'none',
                transition: 'all 0.25s ease',
              }}
            >
              {tier.popular && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-13px',
                    left: isAr ? 'auto' : '50%',
                    right: isAr ? '50%' : 'auto',
                    transform: 'translateX(50%)',
                    background: 'var(--primary-gradient)',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    padding: '4px 14px',
                    borderRadius: '999px',
                    boxShadow: '0 4px 12px rgba(139, 0, 33, 0.35)',
                  }}
                >
                  {isAr ? 'الأكثر طلباً وتوفيراً' : 'Most Popular'}
                </div>
              )}

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)' }}>
                    {isAr ? tier.nameAr : tier.nameEn}
                  </h3>
                  {tier.savingsEn && (
                    <span
                      style={{
                        fontSize: '11.5px',
                        fontWeight: 800,
                        color: 'var(--primary)',
                        background: 'var(--primary-light)',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        border: '1px solid var(--primary-border)',
                      }}
                    >
                      {isAr ? tier.savingsAr : tier.savingsEn}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', margin: '20px 0 6px 0' }}>
                  <span style={{ fontSize: '42px', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-1px' }}>
                    ${tier.perMonth}
                  </span>
                  <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    {isAr ? '/ شهر' : '/ mo'}
                  </span>
                </div>

                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '24px' }}>
                  {isAr ? tier.billingPeriodAr : tier.billingPeriodEn}
                </div>

                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '20px', marginBottom: '24px' }}>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {(isAr ? tier.featuresAr : tier.featuresEn).map((feat, idx) => (
                      <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                        <div
                          style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            background: 'var(--primary-light)',
                            color: 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            marginTop: '2px',
                          }}
                        >
                          <Check size={12} strokeWidth={3} />
                        </div>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRequestAccess();
                }}
                className={tier.popular ? 'btn btn-primary' : 'btn btn-secondary'}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '13.5px',
                  textAlign: 'center',
                }}
              >
                {isAr ? 'ابدأ تجربة الـ 14 يوماً مجاناً' : 'Start 14-Day Free Trial'}
              </button>
            </div>
          );
        })}
      </div>

      <div style={{ textAlign: 'center', marginTop: '48px', color: 'var(--text-muted)', fontSize: '13px' }}>
        <Shield size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
        <span>
          {isAr
            ? 'ضمان استرجاع الأموال لمدة 30 يوماً بعد انتهاء الفترة المجانية. تشفير كامل للبيانات.'
            : 'All paid plans include encrypted multi-tenant data isolation and continuous backups.'}
        </span>
      </div>
    </section>
  );
};
