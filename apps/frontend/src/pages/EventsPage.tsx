import { useState } from 'react'
import {
  View,
  Flex,
  Heading,
  Button,
  Divider,
  Text,
  SearchField,
  Picker,
  Item as PickerItem
} from '@adobe/react-spectrum'
import { EventList } from '../components/EventList'
import { useNavigate } from 'react-router-dom'
import Add from '@spectrum-icons/workflow/Add'

type SortOption = 'startDate' | 'title' | 'createdAt'
type SortOrder = 'asc' | 'desc'

export function EventsPage() {
  const navigate = useNavigate()

  // T114: Search/filter state
  const [searchQuery, setSearchQuery] = useState('')

  // T115: Sorting state
  const [sortBy, setSortBy] = useState<SortOption>('startDate')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')

  return (
    <View padding="size-400" width="100%">
      <Flex direction="column" gap="size-300" width="100%">
        <Flex direction="row" justifyContent="space-between" alignItems="center">
          <Heading level={1}>Events</Heading>
          <Button
            variant="cta"
            onPress={() => navigate('/events/new')}
          >
            <Add />
            <span>Create Event</span>
          </Button>
        </Flex>

        <Divider />

        {/* T114: Search and T115: Sort controls */}
        <Flex direction="row" gap="size-200" wrap="wrap">
          <SearchField
            label="Search events"
            placeholder="Search by title or location..."
            value={searchQuery}
            onChange={setSearchQuery}
            width="size-3600"
          />
          <Picker
            label="Sort by"
            selectedKey={sortBy}
            onSelectionChange={(key) => setSortBy(key as SortOption)}
            width="size-2400"
          >
            <PickerItem key="startDate">Start Date</PickerItem>
            <PickerItem key="title">Title</PickerItem>
            <PickerItem key="createdAt">Created Date</PickerItem>
          </Picker>
          <Picker
            label="Order"
            selectedKey={sortOrder}
            onSelectionChange={(key) => setSortOrder(key as SortOrder)}
            width="size-1600"
          >
            <PickerItem key="asc">Ascending</PickerItem>
            <PickerItem key="desc">Descending</PickerItem>
          </Picker>
        </Flex>

        <EventList
          searchQuery={searchQuery}
          sortBy={sortBy}
          sortOrder={sortOrder}
        />
      </Flex>
    </View>
  )
}
