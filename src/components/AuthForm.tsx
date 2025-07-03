
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image as RNImage, ActivityIndicator, Dimensions } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { appMetaData } from '../services/metadata';

const { width } = Dimensions.get('window');

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
  const [rememberMe, setRememberMe] = useState(false); // State for remember me checkbox
  const APP_META_DATA = appMetaData()?.authform;
  const VALIDATION_ERR_MSG = APP_META_DATA?.validationMsg;

  return (
    <View style={styles.screenContainer}>
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
                  (touched.email && errors.email) || (type === 'signup' && userExistsError) ? styles.inputError : null
                ]}
                placeholder={APP_META_DATA.fields.email.placeholder}
                placeholderTextColor="#a0a0a0" // Lighter placeholder text
                onChangeText={(text) => {
                  handleChange('email')(text);
                  if (userExistsError) setErrors({});
                }}
                onBlur={handleBlur('email')}
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
                    touched.password && errors.password ? styles.inputError : null
                  ]}
                  placeholder={APP_META_DATA.fields.password.placeholder}
                  placeholderTextColor="#a0a0a0" // Lighter placeholder text
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
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
                    color="#7f8c8d"
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
                      touched.confirmPassword && errors.confirmPassword ? styles.inputError : null
                    ]}
                    placeholder={APP_META_DATA.fields.confirmpassword.placeholder}
                    placeholderTextColor="#a0a0a0" // Lighter placeholder text
                    onChangeText={handleChange('confirmPassword')}
                    onBlur={handleBlur('confirmPassword')}
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
                      color="#7f8c8d"
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
                  onPress={() => setRememberMe(!rememberMe)}
                >
                  {rememberMe && <Icon name="check" size={14} color="#3498db" />}
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
            {isLoading ? (
              <ActivityIndicator size="small" color="#3498db" style={styles.loader} />
            ) : (
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                <Text style={styles.submitButtonText}>
                  {type === 'login' ? APP_META_DATA.logintext : APP_META_DATA.signtext}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </Formik>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    width: width,
    height: 600,
    backgroundColor: '#f0f4f7',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    // background: 'linear-gradient(149deg, #ffffff 10% 26%, #1d3aa2 70% 51%),radial-gradient(circle at right, transparent 50%, #beaebc 15%)'
    // back :linear-gradient(149deg, #ffffff 10% 26%, #1d3aa2 70% 51%),radial-gradient(circle at right, transparent 50%, #beaebc 15%);
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    background: 'linear-gradient(149deg, #ffffff 10% 26%, #1d3aa2 70% 51%),radial-gradient(circle at right, transparent 50%, #beaebc 15%)',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  logo: {
    width: 180,
    height: 150,
    marginBottom: 15,
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
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 22,
  },
  inputLabel: {
    fontSize: 14,
    color: '#2c3e50',
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    height: 37,
    borderWidth: 1,
    borderColor: '#dfe6e9',
    borderRadius: 6,
    paddingHorizontal: 15,
    backgroundColor: '#f8f9fa',
    fontSize: 14,
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
    borderColor: '#3498db',
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedBox: {
    backgroundColor: '#f0f8ff',
  },
  rememberMeText: {
    fontSize: 15,
    color: '#2c3e50',
  },
  alternateActionButton: {
    padding: 8,
  },
  alternateActionText: {
    color: '#3498db',
    fontSize: 15,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#3498db',
    height: 46,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: 'bold',
  },
  loader: {
    marginVertical: 15,
  },
});

export default AuthForm;