import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock, Chrome } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, googleLogin } = useAuth();

  const handleLogin = () => {
    if (email && password) {
      login(email);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white justify-center px-8">
      <View className="items-center mb-10">
        <View className="w-20 h-20 bg-indigo-600 rounded-3xl items-center justify-center mb-4 shadow-lg shadow-indigo-200">
          <Text className="text-white text-4xl font-bold">F</Text>
        </View>
        <Text className="text-3xl font-bold text-slate-900">Welcome Back</Text>
        <Text className="text-slate-500 mt-2">Sign in to continue</Text>
      </View>

      <View className="space-y-4 mb-8">
        <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-4 h-14">
          <Mail size={20} color="#64748b" />
          <TextInput
            className="flex-1 ml-3 text-slate-900 font-medium"
            placeholder="Email Address"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
        </View>

        <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-4 h-14">
          <Lock size={20} color="#64748b" />
          <TextInput
            className="flex-1 ml-3 text-slate-900 font-medium"
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity className="items-end">
          <Text className="text-indigo-600 font-medium">Forgot Password?</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        className="bg-indigo-600 h-14 rounded-xl items-center justify-center shadow-lg shadow-indigo-200 mb-6"
        onPress={handleLogin}
      >
        <Text className="text-white font-bold text-lg">Log In</Text>
      </TouchableOpacity>

      <View className="flex-row items-center mb-6">
        <View className="flex-1 h-[1px] bg-slate-200" />
        <Text className="mx-4 text-slate-400 font-medium">OR</Text>
        <View className="flex-1 h-[1px] bg-slate-200" />
      </View>

      <TouchableOpacity
        className="flex-row items-center justify-center bg-white border border-slate-200 h-14 rounded-xl"
        onPress={googleLogin}
      >
        {/* Using Chrome icon as placeholder for Google logo */}
        <Chrome size={24} color="#ea4335" />
        <Text className="ml-3 text-slate-700 font-bold text-base">Continue with Google</Text>
      </TouchableOpacity>

      <View className="flex-row justify-center mt-8">
        <Text className="text-slate-500">Don't have an account? </Text>
        <TouchableOpacity>
          <Text className="text-indigo-600 font-bold">Sign Up</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;