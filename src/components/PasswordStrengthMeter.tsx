import React from 'react';
import { Check, X } from 'lucide-react';

interface PasswordRequirement {
  regex: RegExp;
  text: string;
}

const passwordRequirements: PasswordRequirement[] = [
  { regex: /.{8,}/, text: 'At least 8 characters' },
  { regex: /[A-Z]/, text: 'One uppercase letter' },
  { regex: /[a-z]/, text: 'One lowercase letter' },
  { regex: /[0-9]/, text: 'One number' },
  { regex: /[^A-Za-z0-9]/, text: 'One special character' },
];

interface Props {
  password: string;
}

function PasswordStrengthMeter({ password }: Props) {
  const meetsRequirement = (requirement: PasswordRequirement) => {
    return requirement.regex.test(password);
  };

  const getStrengthPercentage = () => {
    const metRequirements = passwordRequirements.filter(meetsRequirement).length;
    return (metRequirements / passwordRequirements.length) * 100;
  };

  const strengthPercentage = getStrengthPercentage();
  
  const getStrengthColor = () => {
    if (strengthPercentage <= 25) return 'bg-red-500';
    if (strengthPercentage <= 50) return 'bg-orange-500';
    if (strengthPercentage <= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      <div className="space-y-2">
        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${getStrengthColor()}`}
            style={{ width: `${strengthPercentage}%` }}
          />
        </div>
        <div className="text-sm text-gray-600">Password requirements:</div>
        <ul className="space-y-1">
          {passwordRequirements.map((requirement, index) => (
            <li
              key={index}
              className={`flex items-center text-sm ${
                meetsRequirement(requirement) ? 'text-green-600' : 'text-gray-500'
              }`}
            >
              {meetsRequirement(requirement) ? (
                <Check className="h-4 w-4 mr-2" />
              ) : (
                <X className="h-4 w-4 mr-2" />
              )}
              {requirement.text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default PasswordStrengthMeter;