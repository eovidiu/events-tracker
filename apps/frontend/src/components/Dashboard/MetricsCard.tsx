import { View, Text, ProgressCircle } from '@adobe/react-spectrum'
import type { MetricsCardProps } from '../../types/components'

export function MetricsCard({ title, value, percentageChange, trend, icon, isLoading }: MetricsCardProps) {
  if (isLoading) {
    return (
      <View
        padding="size-200"
        borderWidth="thin"
        borderColor="default"
        borderRadius="medium"
        backgroundColor="gray-50"
      >
        <Text>{title}</Text>
        <ProgressCircle aria-label="Loading" isIndeterminate size="S" marginTop="size-100" />
      </View>
    )
  }

  return (
    <View
      padding="size-200"
      borderWidth="thin"
      borderColor="default"
      borderRadius="medium"
      backgroundColor="gray-50"
      data-component="metrics-card"
      data-trend={trend}
    >
      {icon && <View marginBottom="size-100">{icon}</View>}
      <Text>{title}</Text>
      <View marginTop="size-100">
        <Text>
          <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>{value}</span>
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
