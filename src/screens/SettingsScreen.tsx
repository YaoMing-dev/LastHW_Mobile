// Settings Screen
import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, BackHandler, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../contexts/AppContext';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

// UI Text translations
const UI_TEXT = {
  vi: {
    title: 'Cài Đặt',
    currentLang: 'Ngôn Ngữ Giao Diện',
    switchLang: 'Đổi Ngôn Ngữ',
    switchTo: 'Chuyển sang',
    about: 'Về Ứng Dụng',
    version: 'Phiên bản',
    hint: 'Thay đổi ngôn ngữ của giao diện ứng dụng',
    exitApp: 'Thoát Ứng Dụng',
    exitConfirmTitle: 'Xác Nhận Thoát',
    exitConfirmMsg: 'Dữ liệu đã được lưu. Bạn có muốn thoát ứng dụng?',
    exitCancel: 'Hủy',
    exitOk: 'Thoát',
    alertTitle: 'Đã Đổi Ngôn Ngữ',
    alertMsg: 'Giao diện giờ sẽ hiển thị bằng',
  },
  en: {
    title: 'Settings',
    currentLang: 'UI Language',
    switchLang: 'Switch Language',
    switchTo: 'Switch to',
    about: 'About',
    version: 'Version',
    hint: 'Changes the language of the app interface',
    exitApp: 'Exit App',
    exitConfirmTitle: 'Confirm Exit',
    exitConfirmMsg: 'Your data has been saved. Do you want to exit the app?',
    exitCancel: 'Cancel',
    exitOk: 'Exit',
    alertTitle: 'Language Changed',
    alertMsg: 'UI will now display in',
  },
};

export default function SettingsScreen() {
  const { uiLanguage, setUILanguage, speechLanguage } = useAppContext();
  const t = UI_TEXT[uiLanguage];

  const toggleUILanguage = useCallback(() => {
    const newLang: 'vi' | 'en' = uiLanguage === 'vi' ? 'en' : 'vi';
    setUILanguage(newLang);
    Alert.alert(
      t.alertTitle,
      `${t.alertMsg} ${newLang === 'vi' ? '🇻🇳 Tiếng Việt' : '🇬🇧 English'}`,
      [{ text: 'OK' }]
    );
  }, [uiLanguage, setUILanguage, t]);

  const handleExitApp = useCallback(async () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(t.exitConfirmMsg);
      if (!confirmed) return;
      try {
        // Hide React app, show goodbye screen
        const root = document.getElementById('root');
        if (root) root.style.display = 'none';
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;inset:0;display:flex;flex-direction:column;justify-content:center;align-items:center;background:#111;color:#fff;font-family:sans-serif;z-index:99999';
        overlay.innerHTML = '<div style="font-size:48px;margin-bottom:16px">👋</div><div style="font-size:22px;font-weight:600;margin-bottom:8px">Server stopped!</div><div style="font-size:16px;color:#999">You can close this tab now.</div>';
        document.body.appendChild(overlay);
        // Kill Metro dev server
        await fetch('/shutdown').catch(() => {});
      } catch (e) {
        console.error('Exit error:', e);
      }
    } else {
      Alert.alert(
        t.exitConfirmTitle,
        t.exitConfirmMsg,
        [
          { text: t.exitCancel, style: 'cancel' },
          { text: t.exitOk, style: 'destructive', onPress: () => BackHandler.exitApp() },
        ]
      );
    }
  }, [t]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t.title}</Text>
      </View>

      <View style={styles.content}>
        {/* Current UI Language Display */}
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>{t.currentLang}</Text>
          <Text style={styles.infoValue}>
            {uiLanguage === 'vi' ? '🇻🇳 Tiếng Việt' : '🇬🇧 English'}
          </Text>
          <Text style={styles.infoHint}>
            {t.hint}
          </Text>
        </View>

        {/* UI Language Toggle */}
        <TouchableOpacity
          style={styles.settingItem}
          onPress={toggleUILanguage}
        >
          <View style={styles.settingLeft}>
            <Ionicons name="globe-outline" size={24} color={colors.primary} />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>{t.switchLang}</Text>
              <Text style={styles.settingValue}>
                {t.switchTo} {uiLanguage === 'vi' ? '🇬🇧 English' : '🇻🇳 Tiếng Việt'}
              </Text>
            </View>
          </View>
          <Ionicons name="swap-horizontal" size={24} color={colors.primary} />
        </TouchableOpacity>

        {/* Speech Language Info (Read-only) */}
        <View style={styles.infoBoxSecondary}>
          <Text style={styles.infoLabel}>
            {uiLanguage === 'vi' ? '🎤 Ngôn Ngữ Nói' : '🎤 Speech Language'}
          </Text>
          <Text style={styles.infoValue}>
            {speechLanguage === 'vi-VN' ? '🇻🇳 Tiếng Việt' : '🇬🇧 English'}
          </Text>
          <Text style={styles.infoHint}>
            {uiLanguage === 'vi' 
              ? 'Đổi ngôn ngữ nói ở tab Home' 
              : 'Change speech language in Home tab'}
          </Text>
        </View>

        {/* About */}
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name="information-circle" size={24} color={colors.textSecondary} />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>{t.about}</Text>
              <Text style={styles.settingValue}>{t.version} 2.0.0</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
        </TouchableOpacity>

        {/* FR-12: Exit App */}
        <TouchableOpacity style={styles.exitButton} onPress={handleExitApp}>
          <Ionicons name="exit-outline" size={24} color={colors.error} />
          <Text style={styles.exitText}>{t.exitApp}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  content: {
    paddingTop: spacing.md,
  },
  infoBox: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  infoLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  infoHint: {
    ...typography.body2,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  infoBoxSecondary: {
    backgroundColor: colors.background,
    padding: spacing.lg,
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: spacing.md,
    flex: 1,
  },
  settingLabel: {
    ...typography.body1,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  settingValue: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  exitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    marginHorizontal: spacing.md,
    marginTop: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.error,
  },
  exitText: {
    ...typography.button,
    color: colors.error,
    fontWeight: '700',
  },
});
