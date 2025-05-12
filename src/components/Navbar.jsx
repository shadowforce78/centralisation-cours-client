import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Dashboard as DashboardIcon, 
  CloudUpload as UploadIcon, 
  CloudDownload as DownloadIcon,
  NetworkCheck as NetworkIcon, 
  ExitToApp as LogoutIcon 
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';

function Navbar({ onLogout }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const location = useLocation();
  
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };
    const menuItems = [
    { text: 'Tableau de bord', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Téléverser', icon: <UploadIcon />, path: '/upload' },
    { text: 'Télécharger', icon: <DownloadIcon />, path: '/download' },
    { text: 'Test Connectivité', icon: <NetworkIcon />, path: '/connectivity-test' },
  ];

  const drawer = (
    <Box sx={{ width: 250 }} role="presentation" onClick={handleDrawerToggle}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" component="div">
          Centralisation BUT
        </Typography>
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem 
            button 
            key={item.text} 
            component={Link} 
            to={item.path}
            selected={location.pathname === item.path}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem button onClick={onLogout}>
          <ListItemIcon><LogoutIcon /></ListItemIcon>
          <ListItemText primary="Déconnexion" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Centralisation des Cours BUT
          </Typography>
          
          {!isMobile && menuItems.map((item) => (
            <Button 
              key={item.text}
              color="inherit" 
              component={Link} 
              to={item.path}
              sx={{ 
                mx: 1,
                backgroundColor: location.pathname === item.path ? 'rgba(255, 255, 255, 0.15)' : 'transparent'
              }}
              startIcon={item.icon}
            >
              {item.text}
            </Button>
          ))}
          
          {!isMobile && (
            <Button 
              color="inherit" 
              onClick={onLogout}
              startIcon={<LogoutIcon />}
            >
              Déconnexion
            </Button>
          )}
        </Toolbar>
      </AppBar>
      
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
      >
        {drawer}
      </Drawer>
    </>
  );
}

export default Navbar;