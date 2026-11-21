// Path ikon diambil langsung dari layer VECTOR di gopa-gym.figcraft (16x16, stroke 1.3).
function Ico({ size = 16, className = '', viewBox = '0 0 16 16', children, ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
      {...rest}
    >
      {children}
    </svg>
  );
}

export function IconDashboard(props) {
  return (
    <Ico {...props}>
      <path
        d="M0 0L6.154 0L6.154 6.154L0 6.154L0 0ZM9.846 0L16 0L16 6.154L9.846 6.154L9.846 0ZM0 9.846L6.154 9.846L6.154 16L0 16L0 9.846ZM9.846 9.846L16 9.846L16 16L9.846 16L9.846 9.846Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </Ico>
  );
}

export function IconMembers(props) {
  return (
    <Ico {...props}>
      <path
        d="M0 16C0 12.645 2.462 10.839 5.538 10.839C8.615 10.839 11.077 12.645 11.077 16M11.2 0.387C12.635 0.808 13.627 2.18 13.627 3.742C13.627 5.304 12.635 6.676 11.2 7.097M12.923 10.581C14.892 11.226 16 12.774 16 15.355M5.538 6.968C7.374 6.968 8.862 5.408 8.862 3.484C8.862 1.56 7.374 0 5.538 0C3.703 0 2.215 1.56 2.215 3.484C2.215 5.408 3.703 6.968 5.538 6.968Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Ico>
  );
}

export function IconMemberships(props) {
  return (
    <Ico {...props}>
      <path
        d="M0 5.333L16 5.333M0 0L16 0L16 16L0 16L0 0Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </Ico>
  );
}

export function IconPackages(props) {
  return (
    <Ico {...props}>
      <path
        d="M0 3.692L8 7.385L16 3.692M8 7.385L8 14.769M8 0L16 3.692L16 12.308L8 16L0 12.308L0 3.692L8 0Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Ico>
  );
}

export function IconQr(props) {
  return (
    <Ico {...props}>
      <path
        d="M13.538 10.24L16 10.24L16 12.8M13.538 15.36L16 15.36M0 0L5.538 0L5.538 5.76L0 5.76L0 0ZM9.846 0L15.385 0L15.385 5.76L9.846 5.76L9.846 0ZM0 10.24L5.538 10.24L5.538 16L0 16L0 10.24ZM9.846 10.24L11.692 10.24L11.692 12.16L9.846 12.16L9.846 10.24Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Ico>
  );
}

export function IconAttendance(props) {
  return (
    <Ico {...props}>
      <path
        d="M0 6.154L16 6.154M4 0L4 4.923M12 0L12 4.923M0 2.462L16 2.462L16 16L0 16L0 2.462Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </Ico>
  );
}

export function IconTransactions(props) {
  return (
    <Ico {...props}>
      <path
        d="M4.364 4.571L11.636 4.571M4.364 8L11.636 8M0 0L16 0L16 16L12 13.943L8 16L4 13.943L0 16L0 0Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </Ico>
  );
}

export function IconAnalytics(props) {
  return (
    <Ico {...props}>
      <path d="M0 16L0 8M8 16L8 0M16 16L16 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </Ico>
  );
}

export function IconSettings(props) {
  return (
    <Ico {...props}>
      <path
        d="M8 0L8 2.286M8 13.714L8 16M0 8L2.286 8M13.714 8L16 8M2.4 2.4L4 4M12 12L13.6 13.6M13.6 2.4L12 4M4 12L2.4 13.6M8 5.257C6.485 5.257 5.257 6.485 5.257 8C5.257 9.515 6.485 10.743 8 10.743C9.515 10.743 10.743 9.515 10.743 8C10.743 6.485 9.515 5.257 8 5.257Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Ico>
  );
}

export function IconLogout(props) {
  return (
    <Ico {...props}>
      <path
        d="M5.091 0L0 0L0 16L5.091 16M10.909 3.333L16 8L10.909 12.667M16 8L4.364 8"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Ico>
  );
}

export function IconSearch({ size = 14, ...props }) {
  return (
    <Ico size={size} viewBox="0 0 14 14" {...props}>
      <path
        d="M10.055 10.055L14 14M5.727 11.455C8.89 11.455 11.455 8.89 11.455 5.727C11.455 2.564 8.89 0 5.727 0C2.564 0 0 2.564 0 5.727C0 8.89 2.564 11.455 5.727 11.455Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </Ico>
  );
}

export function IconBell(props) {
  return (
    <Ico {...props}>
      <path
        d="M5.818 14.669C6.157 15.469 7.027 16 8 16C8.973 16 9.843 15.469 10.182 14.669M8 0C11.213 0 13.818 2.284 13.818 5.102L13.818 8.929L16 12.118L0 12.118L2.182 8.929L2.182 5.102C2.182 2.284 4.787 0 8 0Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Ico>
  );
}

export function IconTrend({ size = 20, ...props }) {
  return (
    <Ico size={size} viewBox="0 0 20 20" {...props}>
      <path
        d="M0 20L20 0M2.5 0L20 0L20 17.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Ico>
  );
}
