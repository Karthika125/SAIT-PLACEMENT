export const dashboardStyles = {
  root: {
    minHeight: '100vh',
    backgroundColor: 'background.default',
  },
  header: {
    backgroundColor: 'background.paper',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    py: 2,
  },
  mainContent: {
    py: 4,
    px: { xs: 2, sm: 4 },
  },
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.2s',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
    },
  },
  cardHeader: {
    pb: 0,
  },
  cardContent: {
    pt: 2,
    pb: '16px !important',
    flex: 1,
  },
  uploadSection: {
    textAlign: 'center',
    p: 3,
    border: '2px dashed',
    borderColor: 'primary.light',
    borderRadius: 2,
    backgroundColor: 'background.paper',
    mb: 3,
  },
  matchScore: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    my: 1,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    flex: 1,
  },
  companyCard: {
    mb: 2,
    '&:last-child': {
      mb: 0,
    },
  },
  chipArray: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 0.5,
    mt: 1,
  },
  actionButton: {
    mt: 2,
  },
  mockTestCard: {
    p: 2,
    mb: 2,
    '&:last-child': {
      mb: 0,
    },
  },
  statsCard: {
    p: 2,
    textAlign: 'center',
  },
  statsValue: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: 'primary.main',
  },
  statsLabel: {
    color: 'text.secondary',
    mt: 1,
  },
};
