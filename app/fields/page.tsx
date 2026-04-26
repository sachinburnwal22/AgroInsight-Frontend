'use client';

import { motion } from 'framer-motion';
import { Header } from '@/components/header';
import { Sidebar } from '@/components/sidebar';
import { StatCard } from '@/components/dashboard/stat-card';
import { HoverScale } from '@/components/animations/hover-scale';
import { useState } from 'react';
import { Map, Plus, Edit2, Trash2 } from 'lucide-react';

export default function FieldsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fields = [
    {
      id: 1,
      name: 'North Field',
      area: '45.5',
      crop: 'Wheat',
      health: '92',
      moisture: '68',
    },
    {
      id: 2,
      name: 'South Field',
      area: '38.2',
      crop: 'Corn',
      health: '78',
      moisture: '72',
    },
    {
      id: 3,
      name: 'East Field',
      area: '52.1',
      crop: 'Rice',
      health: '55',
      moisture: '65',
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
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl font-bold text-foreground mb-2">
                Field Management
              </h1>
              <p className="text-muted-foreground">
                Manage and monitor all your agricultural fields
              </p>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-shadow"
            >
              <Plus className="w-5 h-5" />
              Add Field
            </motion.button>
          </div>

          {/* Fields Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {fields.map((field, index) => (
              <HoverScale key={field.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-card border border-border rounded-xl p-6 backdrop-blur-sm"
                >
                  <div className="flex items-start justify-between mb-4">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="p-3 rounded-lg bg-primary/20"
                    >
                      <Map className="w-6 h-6 text-primary" />
                    </motion.div>
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4 text-foreground" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 hover:bg-destructive/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </motion.button>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    {field.name}
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Area</p>
                      <p className="font-semibold text-foreground">
                        {field.area} hectares
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Crop</p>
                      <p className="font-semibold text-foreground">{field.crop}</p>
                    </div>
                    <div className="flex gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Health</p>
                        <p className="font-semibold text-primary">
                          {field.health}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Moisture</p>
                        <p className="font-semibold text-accent">
                          {field.moisture}%
                        </p>
                      </div>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ x: 5 }}
                    className="w-full mt-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:shadow-lg transition-shadow"
                  >
                    View Details
                  </motion.button>
                </motion.div>
              </HoverScale>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
