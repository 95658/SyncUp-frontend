export type Language = 'en' | 'ar';

export const translations = {
  en: {
    // Brand
    brandName: 'SyncUp',
    brandTagline: 'B2B SaaS Workspace',
    superAdmin: 'SUPER ADMIN',

    // Navigation
    platformOverview: 'Platform Overview',
    organizations: 'Organizations',
    administrators: 'Org Administrators',
    platformUsers: 'Platform Users',
    platformInvitations: 'Platform Invitations',
    auditLogs: 'Audit Trail Logs',
    platformSettings: 'Platform Settings',

    dashboard: 'Dashboard',
    projects: 'Projects',
    tasks: 'Tasks',
    chat: 'Team Chat',
    calendar: 'Calendar',
    files: 'Files',
    members: 'Members & Teams',
    orgSettings: 'Org Settings',
    logout: 'Log Out',
    myProfile: 'My Profile',

    // Role & Header
    role: 'Role',
    platformOwner: 'Platform Owner',
    orgAdmin: 'Org Owner & Admin',
    teamMember: 'Team Member',
    searchPlaceholder: 'Search tasks, projects, messages...',
    searchAdminPlaceholder: 'Search organizations, administrators, or audit logs...',
    newProject: 'New Project',
    newTask: 'New Task',
    addMember: 'Add Member',
    provisionOrg: 'Provision Org',
    notifications: 'Notifications',
    helpDoc: 'Help & Docs',

    // Jira Sprints & Backlog
    backlog: 'Backlog',
    activeSprint: 'Active Sprint Board',
    createSprint: 'Create Sprint',
    startSprint: 'Start Sprint',
    completeSprint: 'Complete Sprint',
    sprintGoal: 'Sprint Goal',
    storyPoints: 'Story Points',
    userStory: 'User Story',
    bugIssue: 'Bug / Issue',
    coreTask: 'Task',
    featureTicket: 'Feature Ticket',
    moveToSprint: 'Move to Sprint',
    moveToBacklog: 'Move to Backlog',
    createIssue: 'Create Issue',
    issuesCount: 'issues',
    planned: 'Planned',
    active: 'Active',
    completed: 'Completed',

    // Tasks & Board
    allTasks: 'All Tasks',
    assignedToMe: 'Assigned to Me',
    myTeamTasks: 'My Team Tasks',
    todo: 'To Do',
    inProgress: 'In Progress',
    inReview: 'In Review',
    done: 'Done',
    addTask: 'Add Task',
    swipeHint: 'Drag or swipe cards between columns',
    statusRestricted: 'Only Product Owner, Organization Owner, or QA can approve tasks to Done.',

    // Estimation Game
    estimationGame: 'Sprint Planning Poker',
    voteStoryPoints: 'Vote on Story Points',
    calculateDeadline: 'Calculate Sprint Deadline',

    // Chat
    discordChannels: 'Channels',
    textChannels: 'Text Channels',
    directMessages: 'Direct Messages',
    voiceChannels: 'Voice / Huddle',
    typeMessage: 'Type a message...',
    sendAttachment: 'Send Attachment',
    stickers: 'Stickers',

    // Calendar & Meetings
    meetingsCalendar: 'Calendar & Meetings',
    scheduleMeeting: 'Schedule Meeting',
    addToGoogleCalendar: 'Add to Google Calendar',
    month: 'Month',
    week: 'Week',

    // Profile & Settings
    editProfile: 'Edit Profile',
    fullName: 'Full Name',
    jobTitle: 'Job Title',
    email: 'Email',
    phone: 'Phone',
    changeAvatar: 'Change Avatar',
    saveChanges: 'Save Changes',

    // Org Settings
    orgProfile: 'Organization Identity',
    sprintDefaults: 'Sprint & Workflow Defaults',
    securityAccess: 'Security & Permissions',
    dangerZone: 'Danger Zone',
    allowedDomains: 'Allowed Email Domains',
    twoFactorAuth: 'Two-Factor Authentication',

    // Snackbar / Alerts
    actionSuccess: 'Action completed successfully',
    errorOccurred: 'An error occurred',
  },
  ar: {
    // Brand
    brandName: 'سينك آب',
    brandTagline: 'منصة مساحة العمل للشركات',
    superAdmin: 'المشرف العام',

    // Navigation
    platformOverview: 'نظرة عامة على المنصة',
    organizations: 'المؤسسات',
    administrators: 'مديرو المؤسسات',
    platformUsers: 'مستخدمو المنصة',
    platformInvitations: 'الدعوات النشطة',
    auditLogs: 'سجل التدقيق والأحداث',
    platformSettings: 'إعدادات المنصة',

    dashboard: 'لوحة التحكم',
    projects: 'المشاريع',
    tasks: 'المهام',
    chat: 'محادثة الفريق',
    calendar: 'التقويم والاجتماعات',
    files: 'الملفات والمستندات',
    members: 'الأعضاء والفرق',
    orgSettings: 'إعدادات المؤسسة',
    logout: 'تسجيل الخروج',
    myProfile: 'ملفي الشخصي',

    // Role & Header
    role: 'الدور',
    platformOwner: 'مالك المنصة',
    orgAdmin: 'مالك المؤسسة والمدير',
    teamMember: 'عضو الفريق',
    searchPlaceholder: 'ابحث في المهام، المشاريع، الرسائل...',
    searchAdminPlaceholder: 'ابحث في المؤسسات، المديرين، أو سجلات التدقيق...',
    newProject: 'مشروع جديد',
    newTask: 'مهمة جديدة',
    addMember: 'إضافة عضو',
    provisionOrg: 'إنشاء مؤسسة',
    notifications: 'الإشعارات',
    helpDoc: 'المساعدة والوثائق',

    // Jira Sprints & Backlog
    backlog: 'سجل تراكم المهام (Backlog)',
    activeSprint: 'لوحة السبرنت النشط (Board)',
    createSprint: 'إنشاء سبرنت جديد',
    startSprint: 'بدء السبرنت',
    completeSprint: 'إتمام السبرنت',
    sprintGoal: 'هدف السبرنت',
    storyPoints: 'نقاط القصة (Story Points)',
    userStory: 'قصة مستخدم',
    bugIssue: 'خطأ / بلاغ',
    coreTask: 'مهمة عمل',
    featureTicket: 'تذكرة ميزة',
    moveToSprint: 'نقل إلى السبرنت',
    moveToBacklog: 'إعادة إلى الـ Backlog',
    createIssue: 'إضافة تذكرة / مهمة',
    issuesCount: 'عناصر',
    planned: 'مجدول',
    active: 'نشط الآن',
    completed: 'مكتمل',

    // Tasks & Board
    allTasks: 'كل المهام',
    assignedToMe: 'مهامي المعينة لي',
    myTeamTasks: 'مهام فريقي',
    todo: 'قيد الانتظار',
    inProgress: 'قيد التنفيذ',
    inReview: 'قيد المراجعة',
    done: 'مكتمل',
    addTask: 'إضافة مهمة',
    swipeHint: 'اسحب المهام بين الأعمدة للتحديث المباشر',
    statusRestricted: 'يقتصر نقل المهام إلى مكتمل على مالك المؤسسة ومسؤول المنتج وفريق الجودة فقط.',

    // Estimation Game
    estimationGame: 'لعبة تخمين السبرنت',
    voteStoryPoints: 'التصويت على نقاط القصة',
    calculateDeadline: 'حساب الموعد النهائي للسبرنت',

    // Chat
    discordChannels: 'القنوات',
    textChannels: 'قنوات المحادثة النصية',
    directMessages: 'الرسائل المباشرة',
    voiceChannels: 'قنوات الصوت والاجتماع',
    typeMessage: 'اكتب رسالتك هنا...',
    sendAttachment: 'إرفاق ملف',
    stickers: 'الملصقات',

    // Calendar & Meetings
    meetingsCalendar: 'التقويم وجدولة الاجتماعات',
    scheduleMeeting: 'جدولة اجتماع جديد',
    addToGoogleCalendar: 'إضافة إلى تقويم جوجل',
    month: 'شهر',
    week: 'أسبوع',

    // Profile & Settings
    editProfile: 'تعديل الملف الشخصي',
    fullName: 'الاسم الكامل',
    jobTitle: 'المسمى الوظيفي',
    email: 'البريد الإلكتروني',
    phone: 'رقم الهاتف',
    changeAvatar: 'تغيير الصورة الشخصية',
    saveChanges: 'حفظ التغييرات',

    // Org Settings
    orgProfile: 'هوية المؤسسة',
    sprintDefaults: 'إعدادات السبرنت وتدفق المهام',
    securityAccess: 'الأمان والصلاحيات',
    dangerZone: 'منطقة العمليات الحساسة',
    allowedDomains: 'النطاقات البريدية المصرح بها',
    twoFactorAuth: 'المصادقة الثنائية (2FA)',

    // Snackbar / Alerts
    actionSuccess: 'تم تنفيذ الإجراء بنجاح',
    errorOccurred: 'حدث خطأ أثناء التنفيذ',
  },
};
