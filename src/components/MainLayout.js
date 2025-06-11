import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemText, 
  ListItemIcon,
  Box, 
  Typography, 
  Divider, 
  Avatar, 
  IconButton, 
  Tooltip,
  AppBar,
  Toolbar,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { 
  LogoutOutlined, 
  PersonOutline,
  MenuOutlined,
  DashboardOutlined,
  ArticleOutlined,
  PollOutlined,
  EventOutlined,
  NotificationsOutlined,
  MessageOutlined,
  WarningOutlined,
  CalendarTodayOutlined
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import ResidenceSelector from './ResidenceSelector';
import '../styles/directus-theme.css';

const DRAWER_WIDTH = 280;

const navigationItems = [
  { 
    id: 'dashboard', 
    label: 'Dashboard', 
    icon: DashboardOutlined, 
    path: '/',
    type: 'item'
  },
  { 
    id: 'content-section', 
    label: 'Contenu', 
    type: 'section' 
  },
  { 
    id: 'posts', 
    label: 'Posts', 
    icon: ArticleOutlined, 
    path: '/posts',
    type: 'item'
  },
  { 
    id: 'polls', 
    label: 'Sondages', 
    icon: PollOutlined, 
    path: '/polls',
    type: 'item'
  },
  { 
    id: 'events', 
    label: 'Événements', 
    icon: EventOutlined, 
    path: '/events',
    type: 'item'
  },
  { 
    id: 'calendar', 
    label: 'Calendrier', 
    icon: CalendarTodayOutlined, 
    path: '/events-calendar',
    type: 'item'
  },
  { 
    id: 'communication-section', 
    label: 'Communication', 
    type: 'section' 
  },
  { 
    id: 'daily-messages', 
    label: 'Message du jour', 
    icon: MessageOutlined, 
    path: '/daily-messages',
    type: 'item'
  },
  { 
    id: 'alerts', 
    label: 'Alertes', 
    icon: WarningOutlined, 
    path: '/alerts',
    type: 'item'
  },
];

export default function MainLayout() {
  const { name, email, logout } = useAuth();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const isActiveRoute = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo/Brand */}
      <Box sx={{ 
        p: 3, 
        borderBottom: '1px solid var(--theme-border-subdued)',
        background: 'var(--theme-background-normal)'
      }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 700,
            color: 'var(--theme-primary)',
            fontSize: '1.25rem'
          }}
        >
          FeedActu
        </Typography>
        <Typography 
          variant="caption" 
          sx={{ 
            color: 'var(--theme-foreground-subdued)',
            display: 'block'
          }}
        >
          Gestion de contenu
        </Typography>
      </Box>

      {/* User Profile */}
      <Box sx={{ 
        p: 2.5, 
        borderBottom: '1px solid var(--theme-border-subdued)',
        background: 'var(--theme-background-accent)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
            <Avatar 
              sx={{ 
                mr: 1.5, 
                bgcolor: 'var(--theme-primary)',
                width: 40,
                height: 40
              }}
            >
              <PersonOutline />
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography 
                variant="subtitle2" 
                noWrap 
                title={name}
                sx={{ 
                  fontWeight: 600,
                  color: 'var(--theme-foreground-normal)'
                }}
              >
                {name}
              </Typography>
              <Typography 
                variant="caption" 
                noWrap 
                title={email}
                sx={{ 
                  color: 'var(--theme-foreground-subdued)'
                }}
              >
                {email}
              </Typography>
            </Box>
          </Box>
          <Tooltip title="Se déconnecter">
            <IconButton 
              onClick={handleLogout} 
              size="small"
              sx={{
                color: 'var(--theme-foreground-subdued)',
                '&:hover': {
                  color: 'var(--theme-danger)',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)'
                }
              }}
            >
              <LogoutOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Residence Selector */}
      <Box sx={{ p: 2, borderBottom: '1px solid var(--theme-border-subdued)' }}>
        <ResidenceSelector />
      </Box>

      {/* Navigation */}
      <Box sx={{ flex: 1, overflow: 'auto', py: 1 }}>
        <List disablePadding>
          {navigationItems.map((item) => (
            item.type === 'section' ? (
              <Typography 
                key={item.id}
                className="directus-nav-section"
                sx={{ 
                  px: 2, 
                  py: 1.5, 
                  mt: 2,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--theme-foreground-subdued)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                {item.label}
              </Typography>
            ) : (
              <ListItem key={item.id} disablePadding sx={{ px: 1, mb: 0.5 }}>
                <ListItemButton 
                  component={Link} 
                  to={item.path}
                  className={`directus-nav-item ${isActiveRoute(item.path) ? 'active' : ''}`}
                  sx={{
                    borderRadius: 'var(--theme-border-radius)',
                    py: 1.25,
                    px: 1.5,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: 'var(--theme-background-normal-alt)',
                    },
                    '&.active': {
                      backgroundColor: 'var(--theme-primary-50)',
                      color: 'var(--theme-primary-700)',
                      fontWeight: 500,
                      '& .MuiListItemIcon-root': {
                        color: 'var(--theme-primary-600)',
                      }
                    }
                  }}
                >
                  <ListItemIcon sx={{ 
                    minWidth: 40,
                    color: isActiveRoute(item.path) ? 'var(--theme-primary-600)' : 'var(--theme-foreground-subdued)'
                  }}>
                    <item.icon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: '0.875rem',
                      fontWeight: isActiveRoute(item.path) ? 500 : 400
                    }}
                  />
                </ListItemButton>
              </ListItem>
            )
          ))}
        </List>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Header pour mobile */}
      {isMobile && (
        <AppBar 
          position="fixed" 
          className="directus-header"
          sx={{ 
            zIndex: theme.zIndex.drawer + 1,
            backgroundColor: 'var(--theme-background-normal)',
            color: 'var(--theme-foreground-normal)',
            boxShadow: 'var(--theme-elevation-sm)'
          }}
        >
          <Toolbar>
            <IconButton
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, color: 'var(--theme-foreground-normal)' }}
            >
              <MenuOutlined />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              FeedActu
            </Typography>
          </Toolbar>
        </AppBar>
      )}

      {/* Sidebar */}
      <Box
        component="nav"
        sx={{ 
          width: { md: DRAWER_WIDTH }, 
          flexShrink: { md: 0 } 
        }}
      >
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              '& .MuiDrawer-paper': { 
                boxSizing: 'border-box', 
                width: DRAWER_WIDTH,
                backgroundColor: 'var(--theme-background-normal)',
                borderRight: '1px solid var(--theme-border-subdued)'
              },
            }}
          >
            {drawerContent}
          </Drawer>
        ) : (
          <Drawer
            variant="permanent"
            className="directus-sidebar"
            sx={{
              '& .MuiDrawer-paper': { 
                boxSizing: 'border-box', 
                width: DRAWER_WIDTH,
                backgroundColor: 'var(--theme-background-normal)',
                borderRight: '1px solid var(--theme-border-subdued)',
                position: 'relative'
              },
            }}
            open
          >
            {drawerContent}
          </Drawer>
        )}
      </Box>

      {/* Contenu principal */}
      <Box 
        component="main" 
        className="directus-page"
        sx={{ 
          flexGrow: 1,
          backgroundColor: 'var(--theme-background-page)',
          minHeight: '100vh',
          pt: isMobile ? '64px' : 0,
          px: { xs: 2, md: 4 },
          pt: { xs: 2, md: 4 },
          pb: 0
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
