import { Organization } from '@/types/app';
import Image from 'next/image';
import { FiMapPin } from 'react-icons/fi';

interface OrganizationProps {
    organization: Organization;
}

export default function OrganizationComponent({ organization }: OrganizationProps) {
    return (
        <div className="flex items-start space-x-4">
            {/* Organization Icon */}
            <div className="flex-shrink-0">
                {organization.icon ? (
                    <Image 
                        src={organization.icon} 
                        alt={`${organization.name} logo`}
                        width={64}
                        height={64}
                        className="rounded-full object-cover"
                        onError={(e) => {
                            // Fallback to initials if image fails to load
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                        }}
                    />
                ) : null}
                
                {/* Fallback avatar with initials */}
                <div 
                    className={`w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg ${organization.icon ? 'hidden' : 'flex'}`}
                    style={{ display: organization.icon ? 'none' : 'flex' }}
                >
                    {organization.name.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase()}
                </div>
            </div>

            {/* Organization Info */}
            <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                    {organization.name}
                </h3>
                
                {/* Address */}
                <div className="flex items-start space-x-2 text-gray-600 mb-3">
                    <FiMapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span className="text-sm leading-relaxed">{organization.address}</span>
                </div>
            </div>
        </div>
    );
}
