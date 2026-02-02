<script setup lang="ts">
const STEPS = [
  {
    step: 1,
    title: 'Create Your Event',
    description:
      'Set up your event in minutes with our intuitive form. Add details, set your goal, and customize the experience.',
  },
  {
    step: 2,
    title: 'Share & Invite',
    description:
      'Get a unique event code and link. Share via WhatsApp, SMS, or social media to reach your community.',
  },
  {
    step: 3,
    title: 'Collect Contributions',
    description:
      'Receive payments via M-Pesa, Airtel Money, Tigo Pesa, and bank transfers. All in one place.',
  },
  {
    step: 4,
    title: 'Track & Withdraw',
    description:
      'Monitor contributions in real-time. Withdraw funds directly to your mobile money or bank account.',
  },
]
</script>

<template>
  <section id="how-it-works" class="how-it-works">
    <div class="how-it-works-inner">
      <!-- Section label -->
      <div class="section-label">HOW IT WORKS</div>
      <h2 class="section-heading">Get started in minutes</h2>
      <p class="section-subheading">
        Create your event, share with your community, and start receiving contributions seamlessly.
      </p>

      <!-- Desktop: row of step cards with dashed connectors -->
      <div class="steps-row">
        <template v-for="(item, index) in STEPS" :key="item.step">
          <div class="step-card">
            <div class="step-number">{{ item.step }}</div>
            <h3 class="step-title">{{ item.title }}</h3>
            <p class="step-description">{{ item.description }}</p>
          </div>
          <div v-if="index < STEPS.length - 1" class="connector-h" aria-hidden="true" />
        </template>
      </div>

      <!-- Mobile: column of steps with vertical connectors -->
      <div class="steps-column">
        <template v-for="(item, index) in STEPS" :key="'m-' + item.step">
          <div class="step-row">
            <div class="step-number-m">{{ item.step }}</div>
            <div class="step-content">
              <h3 class="step-title-m">{{ item.title }}</h3>
              <p class="step-description-m">{{ item.description }}</p>
            </div>
          </div>
          <div v-if="index < STEPS.length - 1" class="connector-v" aria-hidden="true" />
        </template>
      </div>
    </div>
  </section>
</template>

<style scoped>
.how-it-works {
  width: 100%;
  max-width: 100%;
  background: #fafafa;
  padding: 100px 24px;
  box-sizing: border-box;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  overflow-x: hidden;
}

@media (max-width: 1280px) {
  .how-it-works {
    padding-left: 24px;
    padding-right: 24px;
  }
}

@media (max-width: 768px) {
  .how-it-works {
    padding: 60px 24px;
  }
}

.how-it-works-inner {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  text-align: center;
  box-sizing: border-box;
}

.section-label {
  display: inline-block;
  padding: 8px 16px;
  background: rgba(26, 32, 44, 0.08);
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: hsl(220, 12%, 18%);
  letter-spacing: 1.5px;
  margin-bottom: 20px;
}

.section-heading {
  font-size: 42px;
  font-weight: 700;
  color: #1a1a2e;
  letter-spacing: -0.5px;
  line-height: 1.2;
  text-align: center;
  margin: 0 0 16px;
}

.section-subheading {
  max-width: 600px;
  margin: 0 auto 72px;
  font-size: 18px;
  color: #6b7280;
  line-height: 1.7;
  font-weight: 400;
  text-align: center;
}

@media (max-width: 768px) {
  .section-heading {
    font-size: 28px;
  }
  .section-subheading {
    font-size: 16px;
    margin-bottom: 48px;
  }
}

/* Desktop: horizontal row of cards */
.steps-row {
  display: none;
}

@media (min-width: 769px) {
  .steps-row {
    display: flex;
    align-items: stretch;
    gap: 0;
  }

  .step-card {
    flex: 1;
    min-width: 0;
    padding: 24px 20px;
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
    transition: box-shadow 0.2s, transform 0.2s;
    text-align: center;
    display: flex;
    flex-direction: column;
  }

  .step-card:hover {
    box-shadow: 0 8px 28px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }

  .step-number {
    width: 70px;
    height: 70px;
    margin: 0 auto 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, hsl(220, 12%, 18%), hsl(220, 12%, 28%));
    border-radius: 20px;
    box-shadow: 0 8px 20px rgba(26, 32, 44, 0.25);
    color: #fff;
    font-size: 26px;
    font-weight: 700;
  }

  .step-title {
    font-size: 18px;
    font-weight: 600;
    color: #1a1a2e;
    line-height: 1.3;
    margin: 0 0 12px;
  }

  .step-description {
    font-size: 14px;
    color: #6b7280;
    line-height: 1.7;
    margin: 0;
    flex: 1;
  }

  .connector-h {
    width: 24px;
    min-width: 24px;
    height: 63px;
    flex-shrink: 0;
    background: repeating-linear-gradient(
      to right,
      rgba(26, 32, 44, 0.3) 0,
      rgba(26, 32, 44, 0.3) 4px,
      transparent 4px,
      transparent 8px
    );
    background-size: 24px 2px;
    background-position: center 61px;
    background-repeat: repeat-x;
  }
}

/* Mobile: vertical column */
.steps-column {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  text-align: left;
}

@media (min-width: 769px) {
  .steps-column {
    display: none;
  }
}

.step-row {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  padding: 8px 0;
}

.step-number-m {
  width: 60px;
  height: 60px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, hsl(220, 12%, 18%), hsl(220, 12%, 28%));
  border-radius: 16px;
  box-shadow: 0 8px 20px rgba(26, 32, 44, 0.25);
  color: #fff;
  font-size: 22px;
  font-weight: 700;
}

.step-content {
  flex: 1;
  min-width: 0;
}

.step-title-m {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0 0 8px;
}

.step-description-m {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.6;
  margin: 0;
}

.connector-v {
  width: 2px;
  height: 40px;
  margin-left: 29px;
  background: linear-gradient(
    to bottom,
    rgba(26, 32, 44, 0.3),
    rgba(26, 32, 44, 0.1)
  );
  flex-shrink: 0;
}
</style>
