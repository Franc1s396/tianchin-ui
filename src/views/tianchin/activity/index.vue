<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="活动名称" prop="activityName">
        <el-input
            v-model="queryParams.activityName"
            placeholder="请输入活动名称"
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
      <el-form-item label="活动状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="活动状态" clearable>
          <el-option
              v-for="dict in activity_status"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="活动类型" prop="status">
        <el-select v-model="queryParams.type" placeholder="活动类型" clearable>
          <el-option
              v-for="dict in activity_type"
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
            v-hasPermi="['tianchin:activity:add']"
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
            v-hasPermi="['tianchin:activity:edit']"
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
            v-hasPermi="['tianchin:activity:remove']"
        >删除
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            icon="Download"
            @click="handleExport"
            v-hasPermi="['tianchin:activity:export']"
        >导出
        </el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="activityList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="活动编号" align="center" prop="activityId"/>
      <el-table-column label="活动名称" align="center" prop="activityName" width="120"/>
      <el-table-column label="渠道名称" align="center" prop="channelName"/>
      <el-table-column label="活动简介" prop="info" :show-overflow-tooltip="true" align="center"/>
      <el-table-column label="活动类型" align="center" prop="type" width="80">
        <template #default="scope">
          <dict-tag :options="activity_type" :value="scope.row.type"/>
        </template>
      </el-table-column>
      <el-table-column label="活动明细" align="center" width="80">
        <template #default="scope">
          <div v-if="scope.row.type===1">
            {{ scope.row.discount }}折
          </div>
          <div v-else>
            {{ scope.row.voucher }}元
          </div>
        </template>
      </el-table-column>
      <el-table-column label="活动状态" align="center" prop="status">
        <template #default="scope">
          <dict-tag :options="activity_status" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="开始时间" align="center" prop="beginTime" width="155">
        <template #default="scope">
          <span>{{ parseTime(scope.row.beginTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="结束时间" align="center" prop="endTime" width="155">
        <template #default="scope">
          <span>{{ parseTime(scope.row.endTime) }}</span>
        </template>
      </el-table-column>
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
              v-hasPermi="['tianchin:activity:edit']"
          >修改
          </el-button>
          <el-button
              type="text"
              icon="Delete"
              @click="handleDelete(scope.row)"
              v-hasPermi="['tianchin:activity:remove']"
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

    <!-- 添加或修改活动对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="activityRef" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="渠道来源" prop="channelId">
              <el-select
                  v-model="form.channelId"
                  placeholder="渠道来源"
                  clearable
                  style="width: 240px"
              >
                <el-option
                    v-for="channel in channelList"
                    :key="channel.channelId"
                    :label="channel.channelName"
                    :value="channel.channelId"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="活动名称" prop="activityName">
              <el-input v-model="form.activityName" placeholder="请输入活动名称"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="活动日期时间" style="width: 100%" prop="activityTime">
              <el-date-picker
                  v-model="form.activityTime"
                  style="width: 100%"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  type="datetimerange"
                  range-separator="-"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
              ></el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="活动简介" prop="info">
          <el-input v-model="form.info" type="textarea" placeholder="请输入活动简介"/>
        </el-form-item>
        <el-form-item label="活动类型" prop="type">
          <el-select
              v-model="form.type"
              placeholder="活动类型"
              clearable
              style="width: 240px"
          >
            <el-option
                v-for="dict in activity_type"
                :key="dict.value"
                :label="dict.label"
                :value="parseInt(dict.value)"
            />
          </el-select>
        </el-form-item>
        <el-row>
          <el-col :span="12">
            <el-form-item v-if="form.type==1" label="折扣券" prop="discount">
              <el-input-number v-model="form.discount" :precision="2" :step="0.1" :min="0" :max="10"/>
            </el-form-item>
            <el-form-item v-if="form.type==2" label="代金券" prop="voucher">
              <el-input-number v-model="form.voucher" :precision="2" :step="0.1" :min="0"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"/>
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

<script setup name="Post">
import {listChannel} from "../../../api/tianchin/channel";
import {listActivity, getActivity, addActivity, updateActivity, removeActivity} from "../../../api/tianchin/activity";

const {proxy} = getCurrentInstance();
const {
  sys_normal_disable,
  activity_type,
  activity_status
} = proxy.useDict("sys_normal_disable", "activity_type", "activity_status");

const activityList = ref([]);
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
    activityName: undefined,
    channelId: undefined,
    type: undefined,
    status: undefined
  },
  rules: {
    channelId: [{required: true, message: "渠道来源不能为空", trigger: "blur"}],
    activityName: [{required: true, message: "活动名称不能为空", trigger: "blur"}],
    info: [{required: true, message: "活动简介不能为空", trigger: "blur"}],
    type: [{required: true, message: "活动类型不能为空", trigger: "blur"}],
    discount: [{required: true, message: "折扣值不能为空", trigger: "blur"}],
    voucher: [{required: true, message: "代金值不能为空", trigger: "blur"}],
    activityTime: [{required: true, message: "活动起始时间不能为空", trigger: "blur"}],
  }
});

const {queryParams, form, rules} = toRefs(data);

/** 查询活动列表 */
function getList() {
  loading.value = true;
  listActivity(queryParams.value).then(response => {
    activityList.value = response.data.records;
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
    activityId: undefined,
    activityName: undefined,
    channelId: undefined,
    info: undefined,
    type: undefined,
    discount: undefined,
    voucher: undefined,
    activityTime: undefined,
    remark: undefined
  };
  proxy.resetForm("activityRef");
}

function handleListChannel(){
  listChannel().then(response=>{
    channelList.value=response.data;
  })
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
  ids.value = selection.map(item => item.activityId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  handleListChannel();
  open.value = true;
  title.value = "添加活动";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  handleListChannel();
  const activityId = row.activityId || ids.value;
  getActivity(activityId).then(response => {
    form.value = response.data;
    form.value.activityTime=[];
    form.value.activityTime.push(form.value.beginTime);
    form.value.activityTime.push(form.value.endTime);
    open.value = true;
    title.value = "修改活动";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["activityRef"].validate(valid => {
    if (valid) {
      form.value.beginTime=form.value.activityTime[0];
      form.value.endTime=form.value.activityTime[1];
      delete form.value.activityTime
      if (form.value.activityId !== undefined) {
        updateActivity(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addActivity(form.value).then(response => {
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
  const activityIds = row.activityId || ids.value;
  proxy.$modal.confirm('是否确认删除活动编号为"' + activityIds + '"的数据项？').then(function () {
    return removeActivity(activityIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {
  });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download("tianchin/activity/export", {
    ...queryParams.value
  }, `post_${new Date().getTime()}.xlsx`);
}

getList();
handleListChannel();
</script>
