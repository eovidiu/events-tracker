import { View, Text, ProgressCircle } from '@adobe/react-spectrum'
import type { MetricsCardProps } from '../../types/components'

export function MetricsCard({ title, value, percentageChange, trend, icon, isLoading }: MetricsCardProps) {
  if (isLoading) {
    return (
      <View
        padding="size-300"
        borderWidth="thin"
        borderColor="default"
        borderRadius="medium"
        backgroundColor="gray-50"
        UNSAFE_style={{ flex: '1 1 200px', minWidth: '200px', maxWidth: '280px' }}
      >
        <Text UNSAFE_style={{ fontSize: '0.875rem', color: 'var(--spectrum-global-color-gray-700)' }}>
          {title}
        </Text>
        <ProgressCircle aria-label="Loading" isIndeterminate size="S" marginTop="size-100" />
      </View>
    )
  }

  return (
    <View
      padding="size-300"
      borderWidth="thin"
      borderColor="default"
      borderRadius="medium"
      backgroundColor="gray-50"
      UNSAFE_style={{ flex: '1 1 200px', minWidth: '200px', maxWidth: '280px' }}
      data-component="metrics-card"
      data-trend={trend}
    >
      {icon && <View marginBottom="size-100">{icon}</View>}
      <Text UNSAFE_style={{ fontSize: '0.875rem', color: 'var(--spectrum-global-color-gray-700)' }}>
        {title}
      </Text>
      <View marginTop="size-100">
        <Text UNSAFE_style={{ fontSize: '2rem', fontWeight: 'bold', display: 'block' }}>
          {value}
        </Text>
      </View>
      {percentageChange !== null && (
        <View marginTop="size-50">
          <Text>
            <span
              style={{
                color:
                  trend === 'up'
                    ? 'green'
                    : trend === 'down'
                      ? 'red'
                      : 'gray',
              }}
            >
              {percentageChange > 0 ? '+' : ''}
              {percentageChange}%
            </span>
          </Text>
        </View>
      )}
    </View>
  )
}
