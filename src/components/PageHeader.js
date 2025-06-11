import React from 'react';
import { 
  Box, 
  Typography, 
  Breadcrumbs, 
  Link, 
  Button,
  Chip,
  Stack
} from '@mui/material';
import { NavigateNext, Add } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

export default function PageHeader({ 
  title, 
  subtitle, 
  breadcrumbs = [], 
  actions = [],
  stats = []
}) {
  return (
    <Box className="directus-page-header" sx={{ mb: 4 }}>
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <Breadcrumbs 
          className="directus-breadcrumbs"
          separator={<NavigateNext fontSize="small" />}
          sx={{ mb: 2 }}
        >
          {breadcrumbs.map((crumb, index) => (
            <Link 
              key={index} 
              component={RouterLink} 
              to={crumb.href}
              color="inherit"
              underline="hover"
            >
              {crumb.label}
            </Link>
          ))}
        </Breadcrumbs>
      )}
      
      {/* Title and Actions */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        mb: subtitle || stats.length > 0 ? 2 : 0,
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              fontWeight: 600,
              color: 'var(--theme-foreground-normal)',
              fontSize: { xs: '1.75rem', md: '2.125rem' }
            }}
          >
            {title}
          </Typography>
          
          {subtitle && (
            <Typography 
              variant="body1" 
              sx={{ 
                color: 'var(--theme-foreground-subdued)',
                mt: 0.5
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
        
        {/* Actions */}
        {actions.length > 0 && (
          <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
            {actions.map((action, index) => (
              <Button 
                key={index} 
                className={action.variant === 'contained' ? 'directus-button-primary' : 'directus-button-secondary'}
                startIcon={action.icon}
                {...action.props}
                sx={{
                  background: action.variant === 'contained' ? 'var(--theme-primary)' : 'var(--theme-background-normal)',
                  color: action.variant === 'contained' ? 'var(--theme-foreground-inverted)' : 'var(--theme-foreground-normal)',
                  border: action.variant !== 'contained' ? '1px solid var(--theme-border-normal)' : 'none',
                  '&:hover': {
                    background: action.variant === 'contained' ? 'var(--theme-primary-600)' : 'var(--theme-background-normal-alt)',
                    borderColor: action.variant !== 'contained' ? 'var(--theme-primary)' : 'transparent',
                  },
                  ...action.props?.sx
                }}
              >
                {action.label}
              </Button>
            ))}
          </Stack>
        )}
      </Box>
      
      {/* Stats */}
      {stats.length > 0 && (
        <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
          {stats.map((stat, index) => (
            <Chip
              key={index}
              label={`${stat.label}: ${stat.value}`}
              variant="outlined"
              size="small"
              sx={{
                borderColor: 'var(--theme-border-normal)',
                color: 'var(--theme-foreground-subdued)',
                '& .MuiChip-label': {
                  fontSize: '0.75rem',
                  fontWeight: 500
                }
              }}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
} 