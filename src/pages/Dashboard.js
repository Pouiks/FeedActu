import React from 'react';
import { 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Avatar,
  Stack,
  Chip,
  LinearProgress,
  Divider,
  Button,
  IconButton
} from '@mui/material';
import { 
  ArticleOutlined,
  PollOutlined,
  EventOutlined,
  NotificationsOutlined,
  TrendingUpOutlined,
  TrendingDownOutlined,
  MoreVertOutlined,
  LaunchOutlined,
  ScheduleOutlined,
  GroupOutlined
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { useResidence } from '../context/ResidenceContext';
import PageHeader from '../components/PageHeader';

const StatCard = ({ title, value, icon, color, trend, trendDirection = 'up', subtitle, progress }) => (
  <Card 
    className="directus-card" 
    sx={{ 
      height: '120px',
      transition: 'all 0.2s ease',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: 'var(--theme-elevation-lg)'
      }
    }}
  >
    <CardContent sx={{ p: 1.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Stack direction="row" alignItems="flex-start" spacing={1.5} sx={{ mb: 0.5 }}>
        <Avatar 
          sx={{ 
            bgcolor: color, 
            width: 40, 
            height: 40,
            boxShadow: `0 4px 8px ${color}30`
          }}
        >
          {icon}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, color: 'var(--theme-foreground-normal)', fontSize: '1.5rem' }}>
            {value}
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--theme-foreground-subdued)', fontSize: '0.75rem' }}>
            {title}
          </Typography>
        </Box>
        
        <IconButton size="small" sx={{ color: 'var(--theme-foreground-subdued)' }}>
          <MoreVertOutlined fontSize="small" />
        </IconButton>
      </Stack>
      
      {subtitle && (
        <Typography variant="caption" sx={{ color: 'var(--theme-foreground-subdued)', mb: 0.5, fontSize: '0.65rem' }}>
          {subtitle}
        </Typography>
      )}
      
      {/* Progress bar compacte */}
      {progress !== undefined && (
        <Box sx={{ mt: 'auto' }}>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ 
              height: 3, 
              borderRadius: 3,
              backgroundColor: 'var(--theme-background-subdued)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: color
              }
            }}
          />
          <Typography variant="caption" sx={{ color: 'var(--theme-foreground-subdued)', fontSize: '0.65rem' }}>
            {progress}%
          </Typography>
        </Box>
      )}
      
      {/* Trend indicator compact */}
      {trend && (
        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 'auto' }}>
          {trendDirection === 'up' ? (
            <TrendingUpOutlined sx={{ fontSize: 12, color: 'var(--theme-success)' }} />
          ) : (
            <TrendingDownOutlined sx={{ fontSize: 12, color: 'var(--theme-danger)' }} />
          )}
          <Typography 
            variant="caption" 
            sx={{ 
              color: trendDirection === 'up' ? 'var(--theme-success)' : 'var(--theme-danger)',
              fontWeight: 500,
              fontSize: '0.65rem'
            }}
          >
            {trend}% vs mois dernier
          </Typography>
        </Stack>
      )}
    </CardContent>
  </Card>
);

const RecentActivityCard = ({ title, items }) => (
  <Card className="directus-card" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
    <CardContent sx={{ p: 1.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
          {title}
        </Typography>
        <Button 
          size="small" 
          endIcon={<LaunchOutlined />}
          sx={{ color: 'var(--theme-primary)', fontSize: '0.75rem' }}
        >
          Voir tout
        </Button>
      </Stack>
      
      <Stack spacing={1.5} sx={{ flex: 1, overflow: 'auto' }}>
        {items.map((item, index) => (
          <Box key={index}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar sx={{ bgcolor: item.color, width: 28, height: 28 }}>
                {item.icon}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.25, fontSize: '0.8rem' }}>
                  {item.title}
                </Typography>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <ScheduleOutlined sx={{ fontSize: 10, color: 'var(--theme-foreground-subdued)' }} />
                  <Typography variant="caption" sx={{ color: 'var(--theme-foreground-subdued)', fontSize: '0.65rem' }}>
                    {item.time}
                  </Typography>
                </Stack>
              </Box>
            </Stack>
            {index < items.length - 1 && <Divider sx={{ mt: 1 }} />}
          </Box>
        ))}
      </Stack>
    </CardContent>
  </Card>
);

const QuickActionsCard = () => (
  <Card className="directus-card">
    <CardContent sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
        Actions Rapides
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<ArticleOutlined />}
            sx={{
              py: 1.5,
              borderColor: 'var(--theme-border-normal)',
              color: 'var(--theme-foreground-normal)',
              '&:hover': {
                borderColor: 'var(--theme-primary)',
                backgroundColor: 'var(--theme-primary-50)'
              }
            }}
          >
            Nouveau Post
          </Button>
        </Grid>
        <Grid item xs={6}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<EventOutlined />}
            sx={{
              py: 1.5,
              borderColor: 'var(--theme-border-normal)',
              color: 'var(--theme-foreground-normal)',
              '&:hover': {
                borderColor: 'var(--theme-primary)',
                backgroundColor: 'var(--theme-primary-50)'
              }
            }}
          >
            Nouvel Événement
          </Button>
        </Grid>
        <Grid item xs={6}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<PollOutlined />}
            sx={{
              py: 1.5,
              borderColor: 'var(--theme-border-normal)',
              color: 'var(--theme-foreground-normal)',
              '&:hover': {
                borderColor: 'var(--theme-primary)',
                backgroundColor: 'var(--theme-primary-50)'
              }
            }}
          >
            Nouveau Sondage
          </Button>
        </Grid>
        <Grid item xs={6}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<NotificationsOutlined />}
            sx={{
              py: 1.5,
              borderColor: 'var(--theme-border-normal)',
              color: 'var(--theme-foreground-normal)',
              '&:hover': {
                borderColor: 'var(--theme-primary)',
                backgroundColor: 'var(--theme-primary-50)'
              }
            }}
          >
            Nouvelle Alerte
          </Button>
        </Grid>
      </Grid>
    </CardContent>
  </Card>
);

export default function Dashboard() {
  const { name } = useAuth();
  const { currentResidenceName } = useResidence();

  // Données améliorées pour l'exemple
  const stats = [
    {
      title: 'Posts Actifs',
      value: '24',
      icon: <ArticleOutlined />,
      color: 'var(--theme-primary)',
      trend: 12,
      trendDirection: 'up',
      subtitle: '6 publiés cette semaine',
      progress: 75
    },
    {
      title: 'Sondages en Cours',
      value: '8',
      icon: <PollOutlined />,
      color: 'var(--theme-success)',
      trend: 5,
      trendDirection: 'up',
      subtitle: '2 se terminent bientôt',
      progress: 60
    },
    {
      title: 'Événements ce Mois',
      value: '15',
      icon: <EventOutlined />,
      color: 'var(--theme-warning)',
      trend: 8,
      trendDirection: 'up',
      subtitle: '3 événements à venir',
      progress: 90
    },
    {
      title: 'Alertes Actives',
      value: '3',
      icon: <NotificationsOutlined />,
      color: 'var(--theme-danger)',
      trend: 25,
      trendDirection: 'down',
      subtitle: '1 critique à traiter'
    }
  ];

  const recentActivities = [
    {
      title: 'Nouveau post publié: "Travaux ascenseur"',
      time: 'Il y a 2 heures',
      icon: <ArticleOutlined fontSize="small" />,
      color: 'var(--theme-primary)'
    },
    {
      title: 'Sondage "Espaces verts" - 45 réponses',
      time: 'Il y a 4 heures',
      icon: <PollOutlined fontSize="small" />,
      color: 'var(--theme-success)'
    },
    {
      title: 'Événement "Fête des voisins" programmé',
      time: 'Il y a 1 jour',
      icon: <EventOutlined fontSize="small" />,
      color: 'var(--theme-warning)'
    },
    {
      title: 'Alerte maintenance résolue',
      time: 'Il y a 2 jours',
      icon: <NotificationsOutlined fontSize="small" />,
      color: 'var(--theme-danger)'
    }
  ];

  return (
    <Box sx={{ height: 'calc(100vh - 96px)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 2 }}>
        <PageHeader
          title={`Bonjour, ${name?.split(' ')[0] || 'Utilisateur'} ! 👋`}
          subtitle={`Résidence actuelle: ${currentResidenceName || 'Aucune sélectionnée'}`}
          breadcrumbs={[
            { label: 'Dashboard', href: '/' }
          ]}
          stats={[
            { label: 'Résidents actifs', value: '156' },
            { label: 'Taux de participation', value: '78%' }
          ]}
        />
      </Box>

      {/* Container principal avec flex */}
      <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {/* Statistiques principales - plus compactes */}
        <Grid container spacing={1.5} sx={{ flexShrink: 0 }}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <StatCard {...stat} />
            </Grid>
          ))}
        </Grid>

        {/* Contenu principal - utilise l'espace restant */}
        <Grid container spacing={1.5} sx={{ flex: 1, overflow: 'hidden' }}>
          <Grid item xs={12} lg={8}>
            <Card className="directus-card" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ p: 1.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                    Aperçu de l'activité
                  </Typography>
                  <Stack direction="row" spacing={0.5}>
                    <Chip label="7 jours" size="small" variant="outlined" sx={{ fontSize: '0.7rem', height: '24px' }} />
                    <Chip label="30 jours" size="small" sx={{ fontSize: '0.7rem', height: '24px' }} />
                    <Chip label="90 jours" size="small" variant="outlined" sx={{ fontSize: '0.7rem', height: '24px' }} />
                  </Stack>
                </Stack>
                
                {/* Zone graphique qui s'adapte */}
                <Box sx={{ 
                  flex: 1,
                  minHeight: 150,
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  justifyContent: 'center',
                  backgroundColor: 'var(--theme-background-accent)',
                  borderRadius: 'var(--theme-border-radius)',
                  border: '2px dashed var(--theme-border-normal)'
                }}>
                  <GroupOutlined sx={{ fontSize: 36, color: 'var(--theme-foreground-subdued)', mb: 1 }} />
                  <Typography variant="h6" sx={{ color: 'var(--theme-foreground-subdued)', mb: 1, fontSize: '1rem' }}>
                    Graphique d'engagement
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', maxWidth: 200, fontSize: '0.8rem' }}>
                    Visualisation des interactions des résidents
                  </Typography>
                  
                  <Stack direction="row" spacing={2} sx={{ mt: 1.5 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" sx={{ color: 'var(--theme-primary)', fontSize: '1.1rem' }}>342</Typography>
                      <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>Vues</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" sx={{ color: 'var(--theme-success)', fontSize: '1.1rem' }}>87</Typography>
                      <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>Interactions</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" sx={{ color: 'var(--theme-warning)', fontSize: '1.1rem' }}>23</Typography>
                      <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>Partages</Typography>
                    </Box>
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} lg={4}>
            <RecentActivityCard 
              title="Activité Récente" 
              items={recentActivities}
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
