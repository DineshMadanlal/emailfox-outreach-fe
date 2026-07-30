<template>
  <div class="contacts-section">
    <div class="full-width">
      <!-- header -->
      <p class="contacts-header-text">
        Set Up Contacts and Mailboxes
      </p>

      <!-- desc -->
      <p class="contacts-desc-text">
        Import your contacts and connect mailboxes for campaign delivery and tracking.
      </p>
    </div>

    <!-- Add Contacts Card -->
    <q-card flat class="add-options-card">
      <!-- header -->
      <div class="options-header">
        <div class="header-icon-squared">
          <LocalSvgIcon image="contacts" class="option-header-icon" />
        </div>

        <p class="option-header-text">
          Add Contacts
        </p>
      </div>

      <!-- content -->
      <div class="options-content">

      </div>
    </q-card>

    <!-- Add Sender Mailboxes Card -->
    <q-card flat class="add-options-card">
      <!-- header -->
      <div class="options-header">
        <div class="header-icon-squared">
          <LocalSvgIcon image="mail" class="option-header-icon" />
        </div>

        <p class="option-header-text">
          Add Sender Mailboxes
        </p>
      </div>

      <!-- content -->
      <div class="options-content">

      </div>
    </q-card>
  </div>
</template>
<script>
// vue
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'SequenceWorkflowSaveContacts',
});
</script>

<style lang="scss" scoped>
.contacts-section {
  width: 100%;
  gap: 24px;
  display: flex;
  flex-direction: column;
  padding: 20px 32px;

  .contacts-header-text {
    color: $black;
    font-size: 16px;
    font-weight: 600;
  }

  .contacts-desc-text {
    color: rgba(var(--black-rgb), 0.8);
    font-size: 14px;
    font-weight: 400;
    line-height: 16px; /* 114.286% */

    margin-top: 6px;
  }

  .add-options-card {
    width: 100%;
    max-width: 745px;
    border: 1px solid $grey-50;

    // header
    .options-header {
      display: flex;
      flex-wrap: wrap;
      padding: 16px 20px;
      align-items: center;

      gap: 12px;
      border-bottom: 1px solid $grey-50;

      .header-icon-squared {
        height: 26px;
        min-width: 26px;
        max-width: 26px;

        padding: 5px;
        border-radius: 4px;
        border: 1px solid rgba(var(--primary-rgb), 0.2);
        background: rgba(var(--primary-rgb), 0.1);

        :deep(.option-header-icon) {
          width: 100%;
          height: 100%;

          @include svg-icon-stroke('path, circle, rect, ellipse', $grey);
        }
      }

      .option-header-text {
        color: $black;
        font-size: 16px;
        font-weight: 600;
      }
    }

    // content
    .options-content {
      width: 100%;
      padding: 16px 20px;
    }
  }

  // xs max
  @media (max-width: $breakpoint-xs-max) {
    padding: 20px 12px;

    .add-options-card {
      // header
      .options-header {
        padding: 16px 12px;
      }

      // content
      .options-content {
        padding: 16px 12px;
      }
    }
  }
}
</style>
