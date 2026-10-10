<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import SectionTitle from '@/components/SectionTitle.vue'
import ToolCard from '@/components/ToolCard.vue'
import ToolDetailDialog from '@/components/ToolDetailDialog.vue'
import { toolCategories, tools } from '@/data/tools'
import { useLocale } from '@/composables/useLocale'

const { t, lp } = useLocale()

const search = ref('')
const activeCategory = ref('all')

// Hộp thoại mô tả dự án: một instance dùng chung cho cả danh sách.
const dialogOpen = ref(false)
const selectedTool = ref(null)

function openTool(tool) {
  selectedTool.value = tool
  dialogOpen.value = true
}

// Deep link mở sẵn hộp thoại của một công cụ, ví dụ:
//   /#/cong-cu/van-ban-hanh-chinh   ·   /?tool=van-ban-hanh-chinh   ·   /#cong-cu?tool=excel-ke-toan
const TOOL_ROUTE = /^#\/(?:cong-cu|tool)(?:\/([^/?]+))?/i

function toolIdFromUrl() {
  if (typeof window === 'undefined') return ''

  const fromQuery = new URLSearchParams(window.location.search).get('tool')
  if (fromQuery) return decodeURIComponent(fromQuery)

  const hash = window.location.hash || ''
  const match = TOOL_ROUTE.exec(hash)
  if (match) return match[1] ? decodeURIComponent(match[1]) : ''

  const hashQuery = hash.includes('?')
    ? new URLSearchParams(hash.slice(hash.indexOf('?') + 1))
    : null
  return decodeURIComponent(hashQuery?.get('tool') ?? '')
}

// Đưa mục “Tài liệu & công cụ” vào tầm mắt để sau khi đóng hộp thoại vẫn thấy danh sách.
function scrollToTools() {
  const section = document.getElementById('cong-cu')
  if (!section) return

  const root = document.documentElement
  const previous = root.style.scrollBehavior
  root.style.scrollBehavior = 'auto'
  window.scrollTo({ top: section.getBoundingClientRect().top + window.scrollY - 80 })
  root.style.scrollBehavior = previous
}

function openToolFromUrl() {
  const id = toolIdFromUrl()
  if (!id) return

  scrollToTools()
  const tool = tools.find((item) => item.id === id)
  if (tool) openTool(tool)
}

onMounted(() => {
  // Chờ một nhịp cho danh sách render xong rồi mới mở hộp thoại từ deep link.
  window.requestAnimationFrame(openToolFromUrl)
  window.addEventListener('hashchange', openToolFromUrl)
})

onBeforeUnmount(() => window.removeEventListener('hashchange', openToolFromUrl))

// Chú thích 3 nhãn trạng thái hiện trên mỗi thẻ công cụ.
const statusLegend = [
  { key: 'available', color: 'success', icon: 'mdi-check-circle-outline' },
  { key: 'inProgress', color: 'warning', icon: 'mdi-progress-wrench' },
  { key: 'planned', color: 'info', icon: 'mdi-calendar-clock-outline' },
]

const normalizedSearch = computed(() => search.value.trim().toLowerCase())

const filteredTools = computed(() => {
  const keyword = normalizedSearch.value
  return tools.filter((tool) => {
    const matchesCategory = activeCategory.value === 'all' || tool.category === activeCategory.value
    if (!matchesCategory) return false
    if (!keyword) return true

    const content = lp(tool)
    return [content.name, content.description, tool.id]
      .filter(Boolean)
      .some((text) => text.toLowerCase().includes(keyword))
  })
})

const hasFilters = computed(
  () => normalizedSearch.value.length > 0 || activeCategory.value !== 'all',
)

function clearFilters() {
  search.value = ''
  activeCategory.value = 'all'
}
</script>

<template>
  <section id="cong-cu" class="section-block">
    <v-container class="section-shell">
      <SectionTitle
        :eyebrow="t('tools.eyebrow')"
        :title="t('tools.title')"
        :subtitle="t('tools.subtitle')"
        icon="mdi-folder-star-outline"
      />

      <v-card v-reveal class="glass-card tools__controls mb-8" elevation="0" rounded="xl">
        <div class="pa-5 pa-md-6 d-flex flex-column flex-md-row align-md-center ga-4">
          <v-text-field
            v-model="search"
            :placeholder="t('tools.searchPlaceholder')"
            prepend-inner-icon="mdi-magnify"
            :aria-label="t('tools.searchPlaceholder')"
            clearable
            hide-details
            class="tools__search"
          />

          <v-chip-group
            v-model="activeCategory"
            mandatory
            filter
            selected-class="text-primary"
            class="tools__chips"
            :aria-label="t('tools.categories.all')"
          >
            <v-chip
              v-for="category in toolCategories"
              :key="category"
              :value="category"
              filter
              variant="outlined"
              :prepend-icon="
                category === 'all'
                  ? 'mdi-view-grid-outline'
                  : category === 'excel'
                    ? 'mdi-microsoft-excel'
                    : category === 'docs'
                      ? 'mdi-file-document-outline'
                      : 'mdi-tools'
              "
            >
              {{ t(`tools.categories.${category}`) }}
            </v-chip>
          </v-chip-group>
        </div>
      </v-card>

      <div class="d-flex align-center justify-space-between flex-wrap ga-2 mb-5 px-1">
        <span class="text-body-2 text-medium-emphasis">
          {{ t('tools.resultsCount', { count: filteredTools.length }) }}
        </span>
        <div class="d-flex flex-wrap align-center ga-4 text-caption text-medium-emphasis">
          <span
            v-for="item in statusLegend"
            :key="item.key"
            class="d-inline-flex align-center ga-1"
          >
            <v-icon :icon="item.icon" :color="item.color" size="14" />
            {{ t(`tools.status.${item.key}`) }}
          </span>
        </div>
        <v-btn
          v-if="hasFilters"
          variant="text"
          size="small"
          color="primary"
          prepend-icon="mdi-filter-off-outline"
          @click="clearFilters"
        >
          {{ t('tools.clear') }}
        </v-btn>
      </div>

      <v-row v-if="filteredTools.length" class="gy-6">
        <v-col v-for="(tool, index) in filteredTools" :key="tool.id" cols="12" sm="6" lg="4">
          <div v-reveal="{ delay: (index % 3) * 90 }" class="h-100">
            <ToolCard :tool="tool" @open="openTool" />
          </div>
        </v-col>
      </v-row>

      <v-sheet v-else v-reveal class="glass-card pa-10 text-center" elevation="0" rounded="xl">
        <v-icon icon="mdi-magnify-close" size="44" color="primary" class="mb-3" />
        <p class="text-body-1 text-medium-emphasis mb-0">{{ t('tools.empty') }}</p>
      </v-sheet>

      <v-alert
        v-reveal
        class="mt-8"
        color="primary"
        variant="tonal"
        rounded="xl"
        icon="mdi-lightbulb-on-outline"
      >
        <div class="d-flex flex-column flex-md-row align-md-center ga-4">
          <span class="flex-grow-1">{{ t('tools.note') }}</span>
          <v-btn
            color="primary"
            variant="flat"
            size="small"
            class="flex-grow-0 flex-shrink-0"
            href="#lien-he"
            append-icon="mdi-arrow-right"
          >
            {{ t('tools.requestCta') }}
          </v-btn>
        </div>
      </v-alert>
    </v-container>

    <ToolDetailDialog
      v-model="dialogOpen"
      :tool="selectedTool"
      @after-leave="selectedTool = null"
    />
  </section>
</template>

<style scoped>
.tools__search {
  /* Trên mobile container xếp dọc: flex-basis sẽ thành chiều cao nên phải để auto. */
  flex: 0 0 auto;
  width: 100%;
}

.tools__chips {
  flex: 0 1 auto;
  min-width: 0;
}

@media (min-width: 960px) {
  .tools__search {
    flex: 1 1 320px;
    width: auto;
    max-width: 420px;
  }
}

@media (max-width: 959px) {
  .tools__chips {
    width: 100%;
    overflow: visible;
  }

  /* Mặc định Vuetify biến chip-group thành dải cuộn ngang; trên mobile ta cho xuống dòng
     để người dùng thấy hết danh mục mà không cần vuốt. */
  .tools__chips :deep(.v-slide-group__container) {
    overflow: visible;
  }

  .tools__chips :deep(.v-slide-group__content) {
    flex-wrap: wrap;
    width: 100%;
    min-width: 0;
  }
}
</style>
