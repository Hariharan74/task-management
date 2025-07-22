

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image as RNImage, ActivityIndicator, Dimensions } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { appMetaData } from '../services/metadata';

const { width, height } = Dimensions.get('window');

const validationSchema = (type: 'login' | 'signup', err: any) => Yup.object().shape({
  email: Yup.string()
    .email(err.email.invalid)
    .required(err.email.require),
  password: Yup.string()
    .min(err.password.min, err.password.invalid)
    .required(err.password.require),
  ...(type === 'signup' && {
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], err.confirmpassword.invalid)
      .required(err.confirmpassword.require)
  })
});

interface AuthFormProps {
  type: 'login' | 'signup';
  onSubmit: (values: { email: string; password: string; confirmPassword?: string }, formikHelpers: any) => void;
  onNavigate: () => void;
  isLoading?: boolean;
  authError?: string | null;
  userExistsError?: boolean;
  logoSource?: any;
}

const AuthForm: React.FC<AuthFormProps> = ({
  type,
  onSubmit,
  onNavigate,
  isLoading,
  authError,
  userExistsError,
  logoSource
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [onFocusPassword, setFocusPassword] = useState(false);
  const [onFocusConPassword, setFocusConPassword] = useState(false);
  const [onFocusEmail, setFocusEmail] = useState(false);

  const [rememberMe, setRememberMe] = useState(false); // State for remember me checkbox
  const APP_META_DATA = appMetaData()?.authform;
  const VALIDATION_ERR_MSG = APP_META_DATA?.validationMsg;
  const clickValidation = (mode:string) => {
    if(isLoading || mode == 'checkbox'){
      setFocusEmail(false)
      setFocusPassword(false)
      setFocusConPassword(false)
    }
    return isLoading;
  }
  return (
    <View style={styles.screenContainer}>
      <LinearGradient
        colors={['#ffffff', '#ffffff', '#17318dff', '#1d3aa2']}
        locations={[0, 0.2, 0.6, 1]}  // Adjusted stops for better transition
        start={{ x: 0, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={styles.gradientBackground} // Use absoluteFill for full coverage
      />
      {/* Radial Gradient Simulation (right side) */}
      <View style={styles.radialOverlay}>
        <LinearGradient
          colors={['transparent', '#FDBC31']}
          locations={[0.5, 0.85]}  // 50% transparent → 15% color
          start={{ x: 1, y: 0.5 }} // Right center
          end={{ x: 0, y: 0.5 }}   // Left center
          style={styles.radialGradient}
        />
      </View>

      <View style={styles.radialOverlayBottom}>
        <LinearGradient
          colors={['transparent', '#FDBC31']}
          locations={[0.5, 0.85]}  // 50% transparent → 15% color
          start={{ x: 1, y: 0.5 }} // Right center
          end={{ x: 1, y: 0.5 }}   // Left center
          style={styles.radialGradientBottom}
        />
      </View>

      <View style={styles.contentContainer}>
        <Formik
          initialValues={type === 'login' ?
            { email: '', password: '' } :
            { email: '', password: '', confirmPassword: '' }
          }
          validationSchema={validationSchema(type, VALIDATION_ERR_MSG)}
          onSubmit={(values, formikHelpers) => onSubmit(values, formikHelpers)}
          validateOnChange={false}
          validateOnBlur={false}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setErrors }) => (
            <View style={styles.formContainer}>
              {/* Logo and Welcome Section */}
              <View style={styles.logoContainer}>
                <RNImage
                  source={logoSource}
                  style={styles.logo}
                  resizeMode="contain"
                />
                <Text style={styles.welcomeTitle}>{type === 'login' ? APP_META_DATA.loginWelcomeTitle : APP_META_DATA.signinWelcomeTitle}</Text>
                <Text style={styles.welcomeSubtitle}>{type === 'login' ? APP_META_DATA.loginWelcomeSubtitle : APP_META_DATA.signinWelcomeSubtitle}</Text>
              </View>

              {/* Error Messages */}
              {authError && (
                <Text style={styles.authError}>{authError}</Text>
              )}
              {type === 'signup' && userExistsError && (
                <Text style={styles.authError}>This email is already registered</Text>
              )}

              {/* Email Field */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{APP_META_DATA.fields.email.label}</Text>
                <TextInput
                  style={[
                    styles.input,
                    onFocusEmail && styles.inputFocused,
                    (touched.email && errors.email) || (type === 'signup' && userExistsError) ? styles.inputError : null
                  ]}
                  placeholder={APP_META_DATA.fields.email.placeholder}
                  placeholderTextColor="#dfe6e9" // Lighter placeholder text
                  onChangeText={(text) => {
                    handleChange('email')(text);
                    if (userExistsError) setErrors({});
                  }}
                  onBlur={handleBlur('email')}
                  onFocus={() => {
                    setFocusEmail(true)
                    setFocusPassword(false)
                    setFocusConPassword(false)
                  }
                  }
                  value={values.email}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {touched.email && errors.email && (
                  <Text style={styles.errorText}>{errors.email}</Text>
                )}
              </View>

              {/* Password Field with Eye Icon */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{APP_META_DATA.fields.password.label}</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[
                      styles.input,
                      styles.passwordInput,
                      onFocusPassword && styles.inputFocused,
                      touched.password && errors.password ? styles.inputError : null
                    ]}
                    placeholder={APP_META_DATA.fields.password.placeholder}
                    placeholderTextColor="#dfe6e9" // Lighter placeholder text
                    onChangeText={handleChange('password')}
                    onBlur={handleBlur('password')}
                    onFocus={() => {
                      setFocusEmail(false)
                      setFocusConPassword(false)
                      setFocusPassword(true)
                    }
                    }
                    value={values.password}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Icon
                      name={showPassword ? 'visibility-off' : 'visibility'}
                      size={20}
                      color="#dfe6e9"
                    />
                  </TouchableOpacity>
                </View>
                {touched.password && errors.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}
              </View>

              {/* Confirm Password Field with Eye Icon (only for signup) */}
              {type === 'signup' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>{APP_META_DATA.fields.confirmpassword.label}</Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={[
                        styles.input,
                        styles.passwordInput,
                        onFocusConPassword && styles.inputFocused,
                        touched.confirmPassword && errors.confirmPassword ? styles.inputError : null,

                      ]}
                      placeholder={APP_META_DATA.fields.confirmpassword.placeholder}
                      placeholderTextColor="#dfe6e9" // Lighter placeholder text
                      onChangeText={handleChange('confirmPassword')}
                      onBlur={handleBlur('confirmPassword')}
                      onFocus={() => {
                        setFocusEmail(false)
                        setFocusPassword(false)
                        setFocusConPassword(true)
                      }
                      }
                      value={values.confirmPassword}
                      secureTextEntry={!showConfirmPassword}
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <Icon
                        name={showConfirmPassword ? 'visibility-off' : 'visibility'}
                        size={20}
                        color="#dfe6e9"
                      />
                    </TouchableOpacity>
                  </View>
                  {touched.confirmPassword && errors.confirmPassword && (
                    <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                  )}
                </View>
              )}

              {/* Remember Me and Alternate Action */}
              <View style={styles.bottomRow}>
                <View style={styles.rememberMeContainer}>
                  <TouchableOpacity
                    style={[styles.checkbox, rememberMe && styles.checkedBox]}
                    onPress={() => 
                      {
                        setRememberMe(!rememberMe)
                        clickValidation('checkbox')

                      }
                    }
                  >
                    {rememberMe && <Icon name="check" size={14} color="#dfe6e9" />}
                  </TouchableOpacity>
                  <Text style={styles.rememberMeText}>{APP_META_DATA.remembermetext}</Text>
                </View>

                <TouchableOpacity
                  onPress={onNavigate}
                  disabled={isLoading}
                  style={styles.alternateActionButton}
                >
                  <Text style={styles.alternateActionText}>
                    {type === 'login' ? APP_META_DATA.signtext : APP_META_DATA.logintext}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Submit Button */}
              {
                (
                  <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSubmit}
                  // disabled={isLoading}
                  >
                    {clickValidation('Button') ? (
                      <ActivityIndicator size="small" color="#131ddcff" />
                    ) : (<Text style={styles.submitButtonText}>
                      {type === 'login' ? APP_META_DATA.logintext || 'Login' : APP_META_DATA.signtext}
                    </Text>)}
                  </TouchableOpacity>
                )}
            </View>
          )}
        </Formik>
      </View>
    </View>
  );
};



const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    width: width,
    height: height,
    // backgroundColor: '#f0f4f7',
    // justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    // position: 'relative'
    // background: backgroundCss()
    // back :linear-gradient(149deg, #ffffff 10% 26%, #1d3aa2 70% 51%),radial-gradient(circle at right, transparent 50%, #beaebc 15%);
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  contentContainer: {
    flex: 1,
    // zIndex: 1,  // Ensure content appears above gradient
    padding: 20,
    backgroundColor: 'transparent',  // Remove white background
  },
  radialOverlay: {
    position: 'absolute',
    right: -120,
    top: 170,
    // width: '50%',        // Cover only right half
    // height: '100%',
    width: 200,  // Circle diameter
    height: 200,
    borderRadius: 150,
    zIndex: 1,
    opacity: 0.3,        // Adjust transparency
    overflow: 'hidden',
  },
  radialGradient: {
    width: '200%',       // Double width for radial effect
    height: '100%',
    transform: [{ scaleX: 2 }], // Horizontal stretch
  },

  radialOverlayBottom: {
    position: 'absolute',
    left: -100,
    bottom: -110,

    // width: '50%',        // Cover only right half
    // height: '100%',
    width: 300,  // Circle diameter
    height: 300,
    borderRadius: 150,
    // zIndex: 1,
    opacity: 0.3,        // Adjust transparency
    overflow: 'hidden',
  },
  radialGradientBottom: {
    width: '200%',       // Double width for radial effect
    height: '100%',
    // transform: [{ scaleX: 2 }], // Horizontal stretch
  },
  formContainer: {
    // width: '100%',
    // justifyContent: 'center',
    // alignItems: 'center',
    // maxWidth: 400,
    width: width,
    height: height,
    // backgroundColor: 'white',
    // borderRadius: 10,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 35,
  },
  logo: {
    width: 180,
    height: 150,
    marginBottom: 50,
  },
  inputGroup: {
    marginBottom: 15, // Consistent spacing between input groups
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 40,
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: 10,
    // zIndex:2

  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#dfe6e9',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#dfe6e9',
    textAlign: 'center',
    lineHeight: 22,
    // marginBottom:60,
  },
  inputLabel: {
    fontSize: 13,
    // color: '#2c3e50',
    color: '#dfe6e9',
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    height: 37,
    borderWidth: 1,
    // borderColor: '#dfe6e9',
    borderColor: '#E6E1FAA3',
    color: '#dfe6e9',
    borderRadius: 6,
    paddingHorizontal: 15,
    // backgroundColor: '#f8f9fa',
    backgroundColor: '#E6E1FAA3',
    fontSize: 13,
  },
  inputFocused: {
    borderColor: '#FFD700',
    borderWidth: 1,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  inputError: {
    borderColor: '#e74c3c',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 13,
    marginTop: 4,
  },
  authError: {
    color: '#e74c3c',
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    backgroundColor: '#ffebee',
    padding: 10,
    borderRadius: 5,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: '#dfe6e9',
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedBox: {
    // backgroundColor: '#f0f8ff',
  },
  rememberMeText: {
    fontSize: 13,
    color: '#dfe6e9',
  },
  alternateActionButton: {
    padding: 8,
  },
  alternateActionText: {
    color: '#dfe6e9',
    fontSize: 13,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#dfe6e9',
    height: 43,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  submitButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  loader: {
    marginVertical: 15,
  },
});

export default AuthForm;