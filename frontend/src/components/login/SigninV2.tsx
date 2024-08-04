import React, {useState} from 'react';
import { useNavigate } from "react-router-dom";
import { validateEmail, validatePassword } from '../../utils/validators';
import Copyright from '../common/Footer';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import AppAppBar from '../landing/components/AppAppBar';
import { LoginUser } from '../../utils/userAuth';
import useAuth from '../../hooks/useAuth';
import { User, UserSignInRequest } from '../../types/user';


// TODO remove, this demo shouldn't need to reset the theme.

const defaultTheme = createTheme();

export default function SignInV2Page() {
  const { signin, loading, error } = useAuth();

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")

  const navigate = useNavigate();

  const emailChange = (event) => {
    event.preventDefault();
    const input = event.target.value;
    setEmail(input)
    setEmailError("");
    const validation = validateEmail(input)
    if (validation.isBlank) {
      return
    }
    setEmailError(validation.message);
  }

  const passwordChange = (event) => {
    event.preventDefault();
    const input = event.target.value;
    setPassword(input)
    setPasswordError("");
    const validation = validatePassword(input);
    if (validation.isBlank) {
      return
    }
    setPasswordError(validation.message);
  }

  const onButtonClick = (event) => {
    event.preventDefault();
    // Set initial error values to empty
    setEmailError("")
    setPasswordError("")

    // Check if the user has entered both fields correctly
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setEmailError(emailValidation.message);
      return;
    }
    
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setPasswordError(emailValidation.message);
    }

    const signinRequest: UserSignInRequest = {
        email: email,
        password: password
    };

    console.log('Calling signin ' + JSON.stringify(signinRequest));
    signin(signinRequest, () => {
        navigate('/');
    });
  }

  return (
    <ThemeProvider theme={defaultTheme}>
      <AppAppBar />
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign in V2
          </Typography>
          <Box component="form" onSubmit={onButtonClick} noValidate sx={{ mt: 1 }}>
            <TextField margin="normal" required fullWidth autoFocus autoComplete="email"
              id="email" 
              label="Email Address" 
              name="email" 
              value={email} 
              onChange={emailChange}
              error={emailError? true : false}
              helperText={emailError ? "Invalid Email :" + emailError : ""}
            />
            
            <TextField margin="normal" required fullWidth autoComplete="current-password"
              id="password" 
              label="Password" 
              name="password" 
              type="password" 
              value={password} 
              onChange={passwordChange}
              error={passwordError? true : false}
              helperText={passwordError ? "Invalid Password :" + passwordError : ""}
            />

            <FormControlLabel control={<Checkbox value="remember" color="primary" />} label="Remember me" />
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
              Sign In
            </Button>
            {error && <p>Sign in error! {error}</p>}

            <Grid container>
              <Grid item xs>
                <Link href="#" variant="body2">
                  Forgot password?
                </Link>
              </Grid>
              <Grid item>
                <Link href="/signup" variant="body2">
                  {"Don't have an account? Sign Up"}
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
        <Copyright sx={{ mt: 8, mb: 4 }} />
      </Container>
    </ThemeProvider>
  );
}