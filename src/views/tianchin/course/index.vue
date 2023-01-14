<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="课程名称" prop="courseName">
        <el-input
            v-model="queryParams.courseName"
            placeholder="请输入课程名称"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="渠道来源" prop="channelId">
        <el-select v-model="queryParams.channelId" placeholder="渠道来源" clearable>
          <el-option
              v-for="channel in channelList"
              :key="channel.channelId"
              :label="channel.channelName"
              :value="channel.channelId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="课程状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="课程状态" clearable>
          <el-option
              v-for="dict in course_status"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="课程类型" prop="status">
        <el-select v-model="queryParams.type" placeholder="课程类型" clearable>
          <el-option
              v-for="dict in course_type"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            type="primary"
            plain
            icon="Plus"
            @click="handleAdd"
            v-hasPermi="['tianchin:course:add']"
        >新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="success"
            plain
            icon="Edit"
            :disabled="single"
            @click="handleUpdate"
            v-hasPermi="['tianchin:course:edit']"
        >修改
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="danger"
            plain
            icon="Delete"
            :disabled="multiple"
            @click="handleDelete"
            v-hasPermi="['tianchin:course:remove']"
        >删除
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            icon="Download"
            @click="handleExport"
            v-hasPermi="['tianchin:course:export']"
        >导出
        </el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="courseList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="课程编号" align="center" prop="courseId"/>
      <el-table-column label="课程名称" align="center" prop="courseName" width="120"/>
      <el-table-column label="课程类型" align="center" prop="type" width="80">
        <template #default="scope">
          <dict-tag :options="course_type" :value="scope.row.type"/>
        </template>
      </el-table-column>
      <el-table-column label="课程价格" align="center" prop="price"/>
      <el-table-column label="适用人群" align="center" prop="applyTo" width="80">
        <template #default="scope">
          <dict-tag :options="course_apply_to" :value="scope.row.applyTo"/>
        </template>
      </el-table-column>
      <el-table-column label="课程简介" prop="info" :show-overflow-tooltip="true" align="center"/>
      <el-table-column label="创建时间" align="center" prop="gmtCreate" width="155">
        <template #default="scope">
          <span>{{ parseTime(scope.row.gmtCreate) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="180">
        <template #default="scope">
          <el-button
              type="text"
              icon="Edit"
              @click="handleUpdate(scope.row)"
              v-hasPermi="['tianchin:course:edit']"
          >修改
          </el-button>
          <el-button
              type="text"
              icon="Delete"
              @click="handleDelete(scope.row)"
              v-hasPermi="['tianchin:course:remove']"
          >删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
        v-show="total > 0"
        :total="total"
        v-model:page="queryParams.pageNo"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
    />

    <!-- 添加或修改课程对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="courseRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="课程名称" prop="courseName">
          <el-input v-model="form.courseName" placeholder="请输入课程名称"/>
        </el-form-item>
        <el-form-item label="课程类型" prop="type">
          <el-select
              v-model="form.type"
              placeholder="课程类型"
              clearable
              style="width: 240px"
          >
            <el-option
                v-for="dict in course_type"
                :key="dict.value"
                :label="dict.label"
                :value="parseInt(dict.value)"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="课程适用人群" prop="applyTo">
          <el-select
              v-model="form.applyTo"
              placeholder="课程适用人群"
              clearable
              style="width: 240px"
          >
            <el-option
                v-for="dict in course_apply_to"
                :key="dict.value"
                :label="dict.label"
                :value="parseInt(dict.value)"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="课程描述信息" prop="info">
          <el-input v-model="form.info" type="textarea" placeholder="请输入课程描述信息"/>
        </el-form-item>
        <el-form-item label="课程价格" prop="price">
          <el-input-number v-model="form.price" :precision="2" :step="0.1" :min="0"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Course">
import {listCourse, getCourse, addCourse, updateCourse, removeCourse} from "../../../api/tianchin/course";

const {proxy} = getCurrentInstance();
const {
  course_type,
  course_apply_to
} = proxy.useDict("course_type", "course_apply_to");

const courseList = ref([]);
const channelList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const dateRange = ref([]);


const data = reactive({
  form: {},
  queryParams: {
    pageNo: 1,
    pageSize: 10,
    courseName: undefined,
    channelId: undefined,
    type: undefined,
    status: undefined
  },
  rules: {
    courseName: [{required: true, message: "课程名称不能为空", trigger: "blur"}],
    info: [{required: true, message: "课程简介不能为空", trigger: "blur"}],
    type: [{required: true, message: "课程类型不能为空", trigger: "blur"}],
    applyTo: [{required: true, message: "折扣值不能为空", trigger: "blur"}],
    price: [{required: true, message: "代金值不能为空", trigger: "blur"}],
  }
});

const {queryParams, form, rules} = toRefs(data);

/** 查询课程列表 */
function getList() {
  loading.value = true;
  listCourse(queryParams.value).then(response => {
    courseList.value = response.data.records;
    total.value = response.data.total;
    loading.value = false;
  });
}

/** 取消按钮 */
function cancel() {
  open.value = false;
  reset();
}

/** 表单重置 */
function reset() {
  form.value = {
    courseId: undefined,
    courseName: undefined,
    info: undefined,
    type: undefined,
    applyTo: undefined,
    price: undefined
  };
  proxy.resetForm("courseRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNo = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.courseId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加课程";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const courseId = row.courseId || ids.value;
  getCourse(courseId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改课程";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["courseRef"].validate(valid => {
    if (valid) {
      if (form.value.courseId !== undefined) {
        updateCourse(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addCourse(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const courseIds = row.courseId || ids.value;
  proxy.$modal.confirm('是否确认删除课程编号为"' + courseIds + '"的数据项？').then(function () {
    return removeCourse(courseIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {
  });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download("tianchin/course/export", {
    ...queryParams.value
  }, `course_${new Date().getTime()}.xlsx`);
}

getList();
</script>
