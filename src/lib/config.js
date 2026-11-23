const env = import.meta.env;

export const config = {
  appName: env.VITE_APP_NAME || 'Gopa Gym',
  gym: {
    address: env.VITE_GYM_ADDRESS || 'Jl. Bypass Ngurah Rai No.88, Karangasem',
    email: env.VITE_GYM_EMAIL || 'hello@gopagym.id',
    phone: env.VITE_GYM_PHONE || '+62 812 3456 7890',
    hours: env.VITE_GYM_HOURS || '06.00 - 22.00 WIB',
  },
  maxPhotoKb: Number(env.VITE_MAX_PHOTO_KB) || 500,
  showDemoAccounts: env.VITE_SHOW_DEMO_ACCOUNTS !== 'false',
};

export const demoAccounts = [
  {
    label: 'Admin',
    email: env.VITE_DEMO_ADMIN_EMAIL || 'admin@example.com',
    password: env.VITE_DEMO_ADMIN_PASSWORD || 'demo-admin',
    role: 'admin',
    name: 'Raka Pratama',
    memberId: null,
  },
  {
    label: 'Member',
    email: env.VITE_DEMO_MEMBER_EMAIL || 'member@example.com',
    password: env.VITE_DEMO_MEMBER_PASSWORD || 'demo-member',
    role: 'member',
    name: 'Arif Rahman',
    memberId: 1,
  },
];
