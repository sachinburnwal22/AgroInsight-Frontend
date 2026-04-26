'use client';

import { motion } from 'framer-motion';
import { Header } from '@/components/header';
import { Sidebar } from '@/components/sidebar';
import { useState } from 'react';
import {
  Bell,
  Lock,
  User,
  Database,
  Eye,
  EyeOff,
  Save,
} from 'lucide-react';

export default function SettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const settingsSections = [
    {
      title: 'Profile Settings',
      icon: User,
      settings: [
        { label: 'Full Name', value: 'John Farmer', editable: true },
        { label: 'Email', value: 'john@farm.com', editable: true },
        { label: 'Phone', value: '+1 (555) 123-4567', editable: true },
      ],
    },
    {
      title: 'Notifications',
      icon: Bell,
      settings: [
        { label: 'Email Alerts', toggle: true, enabled: true },
        { label: 'SMS Notifications', toggle: true, enabled: false },
        { label: 'Weekly Reports', toggle: true, enabled: true },
      ],
    },
    {
      title: 'Security',
      icon: Lock,
      settings: [
        { label: 'Password', value: '••••••••', editable: false, password: true },
        { label: 'Two-Factor Auth', toggle: true, enabled: false },
      ],
    },
    {
      title: 'Data & Storage',
      icon: Database,
      settings: [
        { label: 'Storage Used', value: '2.4 GB / 100 GB', editable: false },
        { label: 'Backup Frequency', value: 'Daily', editable: true },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="md:ml-0 pt-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Settings
            </h1>
            <p className="text-muted-foreground">
              Manage your account and preferences
            </p>
          </motion.div>

          {/* Settings Sections */}
          <div className="space-y-6">
            {settingsSections.map((section, sectionIndex) => {
              const Icon = section.icon;
              return (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: sectionIndex * 0.1 }}
                  className="bg-card border border-border rounded-xl p-6 backdrop-blur-sm"
                >
                  {/* Section Header */}
                  <div className="flex items-center gap-3 mb-6">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 10 }}
                      className="p-3 rounded-lg bg-primary/20"
                    >
                      <Icon className="w-6 h-6 text-primary" />
                    </motion.div>
                    <h2 className="text-xl font-semibold text-foreground">
                      {section.title}
                    </h2>
                  </div>

                  {/* Settings Items */}
                  <div className="space-y-4">
                    {section.settings.map((setting, settingIndex) => (
                      <motion.div
                        key={setting.label}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{
                          delay: sectionIndex * 0.1 + settingIndex * 0.05,
                        }}
                        className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50 hover:border-border transition-colors"
                      >
                        <span className="text-foreground font-medium">
                          {setting.label}
                        </span>

                        {setting.toggle ? (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`relative w-12 h-6 rounded-full transition-colors ${
                              setting.enabled ? 'bg-primary' : 'bg-muted'
                            }`}
                          >
                            <motion.div
                              initial={false}
                              animate={{ x: setting.enabled ? 24 : 0 }}
                              transition={{ type: 'spring', stiffness: 500 }}
                              className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full"
                            />
                          </motion.button>
                        ) : setting.password ? (
                          <div className="flex items-center gap-2">
                            <input
                              type={showPassword ? 'text' : 'password'}
                              value={setting.value}
                              disabled
                              className="bg-transparent text-muted-foreground text-sm"
                            />
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="w-4 h-4 text-muted-foreground" />
                              ) : (
                                <Eye className="w-4 h-4 text-muted-foreground" />
                              )}
                            </motion.button>
                          </div>
                        ) : setting.editable ? (
                          <input
                            type="text"
                            defaultValue={setting.value}
                            className="bg-input text-foreground text-sm rounded px-2 py-1 border border-border focus:border-primary outline-none transition-colors"
                          />
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            {setting.value}
                          </span>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex justify-end gap-4 mt-8"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 rounded-lg border border-border text-foreground font-medium hover:bg-muted transition-colors"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:shadow-lg transition-shadow"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </motion.button>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
