import React, { useState, useEffect } from 'react';
import { useToast } from '@shared/hooks/useToast';
import { biometricApi } from '../utils/api-extensions';
import './BiometricAuth.css';

interface BiometricAuthProps {
  email: string;
  onSuccess: (tokens: { accessToken: string; refreshToken: string }) => void;
}

const BiometricAuth: React.FC<BiometricAuthProps> = ({ email, onSuccess }) => {
  const [isSupported, setIsSupported] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    // 检查浏览器是否支持 WebAuthn
    if (window.PublicKeyCredential) {
      setIsSupported(true);
      checkStatus();
    }
  }, []);

  const checkStatus = async () => {
    try {
      const response = await biometricApi.getStatus();
      setIsEnabled(response.enabled);
    } catch (error) {
      console.error('检查生物识别状态失败:', error);
    }
  };

  // 注册生物识别
  const handleRegister = async () => {
    setIsLoading(true);
    try {
      // 1. 获取注册选项
      const options = await biometricApi.registerOptions();

      // 2. 创建凭证
      const credential = await navigator.credentials.create({
        publicKey: {
          ...options,
          challenge: Uint8Array.from(atob(options.challenge), c => c.charCodeAt(0)),
          user: {
            ...options.user,
            id: Uint8Array.from(options.user.id as any),
          },
        },
      }) as PublicKeyCredential;

      if (!credential) {
        throw new Error('创建凭证失败');
      }

      // 3. 验证注册
      await biometricApi.verifyRegistration({
        id: credential.id,
        rawId: btoa(String.fromCharCode(...new Uint8Array(credential.rawId))),
        response: credential.response,
        type: credential.type,
      });

      setIsEnabled(true);
      showToast('success', '生物识别注册成功！');
    } catch (error) {
      console.error('注册生物识别失败:', error);
      showToast('error', '注册失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 生物识别登录
  const handleAuthenticate = async () => {
    setIsLoading(true);
    try {
      // 1. 获取认证选项
      const options = await biometricApi.authOptions(email);

      // 2. 获取凭证
      const credential = await navigator.credentials.get({
        publicKey: {
          ...options,
          challenge: Uint8Array.from(atob(options.challenge), c => c.charCodeAt(0)),
          allowCredentials: options.allowCredentials.map((cred: any) => ({
            ...cred,
            id: Uint8Array.from(atob(cred.id), c => c.charCodeAt(0)),
          })),
        },
      }) as PublicKeyCredential;

      if (!credential) {
        throw new Error('获取凭证失败');
      }

      // 3. 验证登录
      const response = await biometricApi.verifyAuthentication({
        email,
        id: credential.id,
        rawId: btoa(String.fromCharCode(...new Uint8Array(credential.rawId))),
        response: credential.response,
        type: credential.type,
      });

      showToast('success', '生物识别登录成功！');
      onSuccess(response.tokens);
    } catch (error) {
      console.error('生物识别登录失败:', error);
      showToast('error', '登录失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 移除生物识别
  const handleRemove = async () => {
    if (!confirm('确定要移除生物识别登录吗？')) return;

    setIsLoading(true);
    try {
      await biometricApi.remove();
      setIsEnabled(false);
      showToast('success', '已移除生物识别登录');
    } catch (error) {
      console.error('移除生物识别失败:', error);
      showToast('error', '移除失败');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSupported) {
    return (
      <div className="biometric-auth">
        <p className="not-supported">⚠️ 您的浏览器不支持生物识别登录</p>
      </div>
    );
  }

  return (
    <div className="biometric-auth">
      <div className="biometric-icon">👆</div>
      <h3>生物识别登录</h3>
      
      {isEnabled ? (
        <div className="biometric-actions">
          <button
            className="biometric-button primary"
            onClick={handleAuthenticate}
            disabled={isLoading}
          >
            {isLoading ? '验证中...' : '使用指纹/面容登录'}
          </button>
          <button
            className="biometric-button danger"
            onClick={handleRemove}
            disabled={isLoading}
          >
            移除生物识别
          </button>
        </div>
      ) : (
        <div className="biometric-actions">
          <p className="biometric-description">
            使用指纹或面容识别快速登录
          </p>
          <button
            className="biometric-button primary"
            onClick={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? '注册中...' : '启用生物识别'}
          </button>
        </div>
      )}
    </div>
  );
};

export default BiometricAuth;
