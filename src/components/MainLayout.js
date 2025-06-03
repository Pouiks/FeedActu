import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { 
  Drawer, List, ListItem, ListItemButton, ListItemText, Box, 
  Typography, Divider, Avatar, IconButton, Tooltip
} from '@mui/material';
import { LogoutOutlined, PersonOutline } from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import ResidenceSelector from './ResidenceSelector';

const drawerWidth = 240;

export default function MainLayout() {
  const { name, email, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        {/* Header utilisateur */}
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
            <Avatar sx={{ mr: 1, bgcolor: 'primary.main' }}>
              <PersonOutline />
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle2" noWrap title={name}>
                {name}
              </Typography>
              <Typography variant="caption" color="textSecondary" noWrap title={email}>
                {email}
              </Typography>
            </Box>
          </Box>
          <Tooltip title="Se déconnecter">
            <IconButton onClick={handleLogout} size="small">
              <LogoutOutlined />
            </IconButton>
          </Tooltip>
        </Box>

        <Divider />

        {/* Sélecteur de résidence */}
        <ResidenceSelector />

        <Divider />

        {/* Navigation */}
        <List>
          <ListItem disablePadding>
            <ListItemButton component={Link} to="/">
              <ListItemText primary="Dashboard" />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton component={Link} to="/events-calendar">
              <ListItemText primary="Calendrier des événements" />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton component={Link} to="/posts">
              <ListItemText primary="Posts" />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton component={Link} to="/polls">
              <ListItemText primary="Sondages" />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton component={Link} to="/events">
              <ListItemText primary="Événements" />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton component={Link} to="/daily-messages">
              <ListItemText primary="Message du jour" />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton component={Link} to="/alerts">
              <ListItemText primary="Alertes" />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Outlet />
      </Box>
    </Box>
  );
}
