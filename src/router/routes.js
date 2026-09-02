const routes = [
  {
    path: '/reachme/email/notification',
    component: () => import('src/pages/Auth/AdminLogin.vue'),
    meta: { isSemiPublic: true },
  },

  //
  {
    path: '/',
    component: () => import('layouts/AuthLayout.vue'),
    // Login page is default for the auth layout route
    redirect: '/login',
    children: [
      {
        path: '/login',
        component: () => import('pages/Auth/LoginPage.vue'),
        meta: { isSemiPublic: true },
      },
      // {
      //   path: '/signup',
      //   component: () => import('pages/Auth/SignupPage.vue'),
      //   meta: { isSemiPublic: true },
      // },
      {
        path: '/oauth/callback',
        component: () => import('pages/Auth/OAuthCallback.vue'),
        meta: { isSemiPublic: true },
      },
      // {
      //   path: '/forgot-password',
      //   component: () => import('src/pages/Auth/ForgotPassword.vue'),
      //   meta: { isSemiPublic: true },
      // },
      // {
      //   path: '/reset-password',
      //   component: () => import('src/pages/Auth/ResetPassword.vue'),
      //   meta: { isSemiPublic: true },
      // },
      // {
      //   path: '/user-verification',
      //   component: () => import('src/pages/Auth/OtpVerification.vue'),
      //   meta: { isSemiPublic: true },
      // },
    ],
  },

  // user settings routes
  {
    path: '/user/settings',
    component: () => import('pages/WorkspaceSettings/MainIndex.vue'),
    redirect: '/user/settings/profile',
    meta: { requiresAuth: true },
    children: [
      {
        path: '/user/settings/profile',
        component: () => import('pages/UserSettings/UserProfile.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/user/settings/security',
        component: () => import('pages/UserSettings/UserSecurity.vue'),
        meta: { requiresAuth: true },
      },
    ],
  },

  // create workspace route
  // {
  //   path: '/workspace',
  //   component: () => import('layouts/HeaderLayout.vue'),
  //   meta: { requiresAuth: true },
  //   redirect: '/workspace/choose',
  //   children: [
  //     // create workspace route
  //     {
  //       path: '/workspace/create',
  //       component: () => import('pages/Workspaces/Create.vue'),
  //       meta: { requiresAuth: true },
  //     },
  //     // workspace loader route - used for loading
  //     // workspace data before redirecting to the default workspace route
  //     {
  //       path: '/workspace/choose',
  //       component: () => import('pages/Workspaces/Choose.vue'),
  //       meta: { requiresAuth: true },
  //     },
  //   ],
  // },

  {
    path: '/',
    component: () => import('layouts/AppLayout.vue'),
    meta: { requiresAuth: true },
    redirect: '/outreach/campaigns-all',

    children: [
      // outreach routes
      {
        path: 'outreach',
        component: () => import('pages/Workspaces/Outreach.vue'),
        meta: { requiresAuth: true },
        redirect: '/outreach/analytics',

        children: [
          // All contacts
          {
            path: 'contacts/all',
            component: () => import('pages/Contacts/AllContacts.vue'),
            meta: { requiresAuth: true },
          },

          // All Lists
          {
            path: 'lists/all',
            component: () => import('pages/Lists/AllLists.vue'),
            meta: { requiresAuth: true },
          },
          // lists
          {
            path: 'lists/view/:listId',
            redirect: (to) => ({
              path: `/outreach/lists/view/${to.params.listId}/list-contacts`,
            }),
            component: () => import('pages/ListById/MainIndex.vue'),
            meta: { requiresAuth: true },
            children: [
              {
                path: 'list-contacts',
                component: () => import('pages/ListById/ListContacts.vue'),
                meta: { requiresAuth: true },
              },
              {
                path: 'list-analytics',
                component: () => import('src/pages/ListById/ListAnalytics.vue'),
                meta: { requiresAuth: true },
              },
            ],
          },

          {
            path: 'contacts/upload',
            component: () => import('pages/Contacts/UploadContacts.vue'),
            meta: { requiresAuth: true },
          },
          {
            path: 'contacts/:listId/upload',
            component: () => import('pages/Contacts/UploadContacts.vue'),
            meta: { requiresAuth: true },
          },

          {
            path: 'mailboxes',
            component: () => import('src/pages/Mailboxes/All.vue'),
            meta: { requiresAuth: true },
          },
          {
            path: 'domains',
            component: () => import('src/pages/Domains/All.vue'),
            meta: { requiresAuth: true },
          },
          {
            path: 'linkedin/accounts',
            component: () => import('src/pages/LinkedIn/Accounts.vue'),
            meta: { requiresAuth: true },
          },
          {
            path: 'linkedin/:accountId',
            component: () => import('src/pages/LinkedInById/Index.vue'),
            redirect: (to) => ({
              path: `/outreach/linkedin/${to.params.accountId}/overview`,
            }),
            meta: { requiresAuth: true },
            children: [
              // overview
              {
                path: 'overview',
                component: () => import('src/pages/LinkedInById/Overview.vue'),
                meta: { requiresAuth: true },
              },
            ],
          },
          {
            path: 'mailboxes/new',
            component: () => import('pages/Mailboxes/New.vue'),
            meta: { requiresAuth: true },
          },

          {
            path: 'domain/:domainId',
            redirect: (to) => ({
              path: `/outreach/domain/${to.params.domainId}/overview`,
            }),
            component: () => import('pages/DomainById/Index.vue'),
            meta: { requiresAuth: true },
            children: [
              // overview
              {
                path: 'overview',
                component: () => import('src/pages/DomainById/Overview.vue'),
                meta: { requiresAuth: true },
              },
              // mailboxes
              {
                path: 'mailboxes',
                component: () => import('src/pages/DomainById/Mailboxes.vue'),
                meta: { requiresAuth: true },
              },
              // settings
              {
                path: 'settings',
                component: () => import('src/pages/DomainById/DomainSettings.vue'),
                meta: { requiresAuth: true },
              },
            ],
          },

          {
            path: 'mailbox/:mailboxId',
            redirect: (to) => ({
              path: `/outreach/mailbox/${to.params.mailboxId}/overview`,
            }),
            component: () => import('pages/MailboxById/Index.vue'),
            meta: { requiresAuth: true },
            children: [
              {
                path: 'overview',
                component: () => import('src/pages/MailboxById/Overview.vue'),
                meta: { requiresAuth: true },
              },
              {
                path: 'warmup',
                component: () => import('src/pages/MailboxById/Warmup.vue'),
                meta: { requiresAuth: true },
              },
              {
                path: 'campaigns',
                component: () => import('src/pages/MailboxById/Campaigns.vue'),
                meta: { requiresAuth: true },
              },
              // settings
              {
                path: 'settings',
                component: () => import('src/pages/MailboxById/MailboxSettings.vue'),
                meta: { requiresAuth: true },
              },
              // SMTP Authentication
              {
                path: 'smtp-authentication',
                component: () => import('src/pages/MailboxById/SmtpAuthentication.vue'),
                meta: { requiresAuth: true },
              },
            ],
          },
          {
            path: 'campaigns-all',
            component: () => import('src/pages/Campaigns/All.vue'),
            meta: { requiresAuth: true },
          },
          {
            path: 'campaigns/:campaignId/edit',
            component: () => import('src/pages/Campaigns/Edit.vue'),
            meta: { requiresAuth: true },
            redirect: (to) => ({
              path: `/outreach/campaigns/${to.params.campaignId}/edit/sequence`,
            }),

            children: [
              {
                path: 'sequence',
                meta: { requiresAuth: true },
                component: () => import('components/CampaignWorkflow/FlowBuilder.vue'),
              },
              {
                path: 'contacts',
                meta: { requiresAuth: true },
                component: () => import('components/CampaignWorkflow/ContactsAndAccounts.vue'),
              },
              {
                path: 'settings',
                meta: { requiresAuth: true },
                component: () => import('components/CampaignWorkflow/SaveSettings.vue'),
              },
            ],
          },

          {
            path: 'campaigns/:campaignId',
            redirect: (to) => ({
              path: `/outreach/campaigns/${to.params.campaignId}/analytics`,
            }),
            component: () => import('pages/CampaignById/Index.vue'),
            meta: { requiresAuth: true },
            children: [
              // {
              //   path: 'overview',
              //   component: () => import('src/pages/CampaignById/Overview.vue'),
              //   meta: { requiresAuth: true },
              // },
              // {
              //   path: 'inbox',
              //   component: () => import('src/pages/CampaignById/Inbox.vue'),
              //   meta: { requiresAuth: true },
              // },
              {
                path: 'contacts',
                component: () => import('src/pages/CampaignById/Contacts.vue'),
                meta: { requiresAuth: true },
              },
              {
                path: 'sender-mailboxes',
                component: () => import('src/pages/CampaignById/SenderMailboxes.vue'),
                meta: { requiresAuth: true },
              },
              {
                path: 'linkedin-accounts',
                component: () => import('src/pages/CampaignById/LinkedInAccounts.vue'),
                meta: { requiresAuth: true },
              },
              {
                path: 'analytics',
                redirect: (to) => ({
                  path: `/outreach/campaigns/${to.params.campaignId}/analytics/overview`,
                }),
                component: () => import('src/pages/CampaignById/Analytics/Index.vue'),
                meta: { requiresAuth: true },
                children: [
                  {
                    path: 'overview',
                    component: () => import('src/pages/CampaignById/Analytics/Overview.vue'),
                    meta: { requiresAuth: true },
                  },
                  {
                    path: 'email',
                    component: () => import('src/pages/CampaignById/Analytics/Email.vue'),
                    meta: { requiresAuth: true },
                  },
                  {
                    path: 'linkedin',
                    component: () => import('src/pages/CampaignById/Analytics/LinkedIn.vue'),
                    meta: { requiresAuth: true },
                  },
                ],
              },
              {
                path: 'sequence',
                meta: { requiresAuth: true },
                component: () => import('components/CampaignWorkflow/FlowBuilder.vue'),
              },
              // {
              //   path: 'activity',
              //   component: () => import('src/pages/CampaignById/Activity.vue'),
              //   meta: { requiresAuth: true },
              // },
            ],
          },

          {
            path: 'analytics',
            component: () => import('pages/AnalyticsPage.vue'),
            meta: { requiresAuth: true },
          },
        ],
      },

      // unibox
      {
        path: 'unibox/raw',
        component: () => import('pages/SkyBox/ShowOriginalMessage.vue'),
        meta: { requiresAuth: true },
      },

      {
        path: 'unibox',
        component: () => import('pages/Unibox/MainIndex.vue'),
        redirect: '/unibox/inbox',
        meta: { requiresAuth: true },
        children: [
          {
            path: 'inbox/:threadId?',
            name: 'UniboxInbox',
            component: () => import('pages/Unibox/Inbox.vue'),
            meta: { requiresAuth: true },
          },
          {
            path: 'untracked-replies/:threadId?',
            name: 'UniboxUntrackedReplies',
            component: () => import('pages/Unibox/UntrackedReplies.vue'),
            meta: { requiresAuth: true },
          },
          {
            path: 'important/:threadId?',
            name: 'UniboxImportant',
            component: () => import('pages/Unibox/Important.vue'),
            meta: { requiresAuth: true },
          },
          {
            path: 'bounced/:threadId?',
            name: 'UniboxBounced',
            component: () => import('pages/Unibox/Bounced.vue'),
            meta: { requiresAuth: true },
          },
        ],
      },

      {
        path: 'unibox/preferences',
        component: () => import('pages/SkyBox/Preferences.vue'),
        redirect: '/unibox/preferences/folders',
        meta: { requiresAuth: true },
        children: [
          {
            path: 'folders',
            component: () => import('pages/SkyBox/AllFolders.vue'),
            meta: { requiresAuth: true },
          },
          {
            path: 'folder/add',
            component: () => import('src/pages/SkyBox/SaveFolder.vue'),
            meta: { requiresAuth: true },
          },
          {
            path: 'folder/:id/edit',
            component: () => import('src/pages/SkyBox/SaveFolder.vue'),
            meta: { requiresAuth: true },
          },
        ],
      },

      // workspace settings
      {
        path: 'settings',
        component: () => import('pages/WorkspaceSettings/MainIndex.vue'),
        redirect: '/settings/warmup-profiles',
        meta: { requiresAuth: true },
        children: [
          // general
          // {
          //   path: 'general',
          //   component: () => import('pages/WorkspaceSettings/General.vue'),
          //   meta: { requiresAuth: true },
          // },
          // {
          //   path: 'members/clients',
          //   component: () => import('pages/WorkspaceSettings/ClientMembers.vue'),
          //   meta: { requiresAuth: true },
          // },
          // {
          //   path: 'theme',
          //   component: () => import('pages/WorkspaceSettings/AppTheme.vue'),
          //   meta: { requiresAuth: true },
          // },

          // contact fields
          // {
          //   path: 'contact-fields',
          //   component: () => import('pages/WorkspaceSettings/ContactFields.vue'),
          //   meta: { requiresAuth: true },
          // },

          // delivery controls
          {
            path: 'suppression-list',
            component: () => import('pages/WorkspaceSettings/SuppressionList.vue'),
            meta: { requiresAuth: true },
          },
          {
            path: 'sending-schedule',
            component: () => import('pages/WorkspaceSettings/SendingSchedule.vue'),
            meta: { requiresAuth: true },
          },
          {
            path: 'warmup-profiles',
            component: () => import('pages/WorkspaceSettings/WarmupProfiles.vue'),
            meta: { requiresAuth: true },
          },
          // webhooks
          {
            path: 'webhooks',
            component: () => import('pages/WorkspaceSettings/Webhooks.vue'),
            meta: { requiresAuth: true },
          },
          // reply categorization
          {
            path: 'reply-categorization',
            component: () => import('pages/WorkspaceSettings/ReplyCategorization.vue'),
            meta: { requiresAuth: true },
          },
        ],
      },

      // account settings
      // {
      //   path: 'account',
      //   component: () => import('pages/UserSettings/MainIndex.vue'),
      //   meta: { requiresAuth: true },
      //   redirect: '/account/billing',

      //   children: [
      //     // profile
      //     {
      //       path: 'profile',
      //       component: () => import('src/pages/UserSettings/UserProfile.vue'),
      //       meta: { requiresAuth: true },
      //     },
      //     // billing
      //     {
      //       path: 'billing',
      //       component: () => import('src/pages/UserSettings/BillingSubscription.vue'),
      //       meta: { requiresAuth: true },
      //     },
      //     // team members
      //     {
      //       path: 'team',
      //       component: () => import('src/pages/UserSettings/TeamMembers.vue'),
      //       meta: { requiresAuth: true },
      //     },
      //     // Developer
      //     {
      //       path: 'api',
      //       component: () => import('pages/WorkspaceSettings/AppApi.vue'),
      //       meta: { requiresAuth: true },
      //     },
      //   ],
      // },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
