import React from 'react';
import { CheckCircle, Clock, AlertCircle, Code, FileText, Folder } from 'lucide-react';
import { Step, StepType } from '../types';

interface StepsPanelProps {
  steps: Step[];
}

const getStepIcon = (type?: StepType) => {
  switch (type) {
    case StepType.CreateFile:
      return <FileText className="w-4 h-4" />;
    case StepType.CreateFolder:
      return <Folder className="w-4 h-4" />;
    case StepType.EditFile:
      return <Code className="w-4 h-4" />;
    default:
      return <FileText className="w-4 h-4" />;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="w-4 h-4 text-green-400" />;
    case 'pending':
      return <Clock className="w-4 h-4 text-yellow-400" />;
    case 'error':
      return <AlertCircle className="w-4 h-4 text-red-400" />;
    default:
      return <Clock className="w-4 h-4 text-gray-400" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'border-green-500/30 bg-green-500/5';
    case 'pending':
      return 'border-yellow-500/30 bg-yellow-500/5';
    case 'error':
      return 'border-red-500/30 bg-red-500/5';
    default:
      return 'border-gray-600/30 bg-gray-800/20';
  }
};

export const StepsPanel: React.FC<StepsPanelProps> = ({ steps }) => {
  return (
    <div className="h-full bg-[#0d1117] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-800/50 bg-[#111111]">
        <h3 className="text-sm font-medium text-gray-200">Build Steps</h3>
        <p className="text-xs text-gray-500 mt-1">
          {steps.filter(s => s.status === 'completed').length} of {steps.length} completed
        </p>
      </div>

      {/* Steps List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {steps.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className="w-12 h-12 rounded-full bg-gray-800/50 flex items-center justify-center mb-4">
              <Code className="w-6 h-6 text-gray-500" />
            </div>
            <p className="text-sm text-gray-400 mb-2">No steps yet</p>
            <p className="text-xs text-gray-600 max-w-48 leading-relaxed">
              Build steps will appear here as your project is generated
            </p>
          </div>
        ) : (
          steps.map((step, index) => (
            <div
              key={step.id}
              className={`
                relative p-3 rounded-lg border transition-all duration-200
                ${getStatusColor(step.status)}
                hover:bg-gray-800/30
              `}
            >
              {/* Step Number & Status */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-800/50 text-xs font-medium text-gray-300">
                    {index + 1}
                  </div>
                  <div className="flex items-center space-x-1.5">
                    {getStepIcon(step.type)}
                    <span className="text-xs font-medium text-gray-300 capitalize">
                      {step.type ? step.type.toString().replace(/([A-Z])/g, ' $1').trim() : 'Unknown'}
                    </span>
                  </div>
                </div>
                {getStatusIcon(step.status)}
              </div>

              {/* Step Details */}
              <div className="space-y-2">
                {step.path && (
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">Path:</span>
                    <code className="text-xs bg-gray-800/50 px-2 py-1 rounded text-blue-300 font-mono break-all">
                      {step.path}
                    </code>
                  </div>
                )}

                {step.explanation && (
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {step.explanation}
                  </p>
                )}

                {/* Code Preview for File Operations */}
                {step.code && step.code.length > 0 && (
                  <div className="mt-2">
                    <div className="bg-gray-900/50 rounded border border-gray-700/50 overflow-hidden">
                      <div className="px-3 py-2 bg-gray-800/50 border-b border-gray-700/50">
                        <span className="text-xs text-gray-400 font-medium">Code Preview</span>
                      </div>
                      <div className="p-3 max-h-32 overflow-y-auto">
                        <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap break-words">
                          {step.code.length > 200
                            ? `${step.code.substring(0, 200)}...`
                            : step.code
                          }
                        </pre>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Progress Indicator */}
              {step.status === 'pending' && (
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-yellow-500/5 to-transparent animate-pulse" />
              )}
            </div>
          ))
        )}
      </div>

      {/* Progress Summary */}
      {steps.length > 0 && (
        <div className="p-4 border-t border-gray-800/50 bg-[#111111]">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Progress</span>
            <span className="text-gray-300 font-medium">
              {Math.round((steps.filter(s => s.status === 'completed').length / steps.length) * 100)}%
            </span>
          </div>
          <div className="mt-2 w-full bg-gray-800/50 rounded-full h-1.5">
            <div
              className="bg-gradient-to-r from-blue-500 to-green-500 h-1.5 rounded-full transition-all duration-500"
              style={{
                width: `${(steps.filter(s => s.status === 'completed').length / steps.length) * 100}%`
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};